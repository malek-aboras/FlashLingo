import { NextRequest, NextResponse } from 'next/server';
import { fetchVocabularyFromSheets } from '@/lib/google-sheets';
import { upsertVocabulary } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

async function ensureTablesExist() {
  try {
    // Create vocabulary table
    await sql`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id SERIAL PRIMARY KEY,
        vocab_de TEXT NOT NULL,
        vocab_en TEXT NOT NULL,
        artikel TEXT,
        helping_verb TEXT,
        type TEXT,
        note TEXT,
        example TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(vocab_de, vocab_en)
      )
    `;

    // Create user progress table
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
        remembered BOOLEAN NOT NULL,
        reviewed_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create review schedule table
    await sql`
      CREATE TABLE IF NOT EXISTS review_schedule (
        id SERIAL PRIMARY KEY,
        vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
        scheduled_for DATE NOT NULL,
        times_forgotten INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_vocabulary_type ON vocabulary(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_vocabulary ON user_progress(vocabulary_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_schedule_date ON review_schedule(scheduled_for, completed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_schedule_vocabulary ON review_schedule(vocabulary_id)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_de_en_unique ON vocabulary(vocab_de, vocab_en)`;
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if this is a cron job request
    const searchParams = request.nextUrl.searchParams;
    const isCron = searchParams.get('cron') === 'true';

    console.log(`Starting sync (cron: ${isCron})...`);

    // Ensure database tables exist before syncing
    await ensureTablesExist();

    // Fetch vocabulary from Google Sheets
    const vocabularyData = await fetchVocabularyFromSheets();

    if (vocabularyData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No vocabulary data found in Google Sheets',
        total_imported: 0,
        new_words: 0,
        updated_words: 0,
      });
    }

    // Upsert each vocabulary item into the database
    let newWords = 0;
    let updatedWords = 0;

    for (const vocab of vocabularyData) {
      try {
        const isNew = await upsertVocabulary(vocab);
        if (isNew) {
          newWords++;
        } else {
          updatedWords++;
        }
      } catch (error) {
        console.error(`Error upserting vocab: ${vocab.vocab_de}`, error);
      }
    }

    const result = {
      success: true,
      message: 'Sync completed successfully',
      total_imported: vocabularyData.length,
      new_words: newWords,
      updated_words: updatedWords,
    };

    console.log('Sync result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing from Google Sheets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync vocabulary from Google Sheets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
