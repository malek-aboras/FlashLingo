import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
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

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set up database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
