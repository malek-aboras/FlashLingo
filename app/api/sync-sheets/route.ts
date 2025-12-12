import { NextRequest, NextResponse } from 'next/server';
import { fetchVocabularyFromSheets } from '@/lib/google-sheets';
import { upsertVocabulary, initDatabase } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initDatabase();

    // Check if this is a cron job request
    const searchParams = request.nextUrl.searchParams;
    const isCron = searchParams.get('cron') === 'true';

    console.log(`Starting sync (cron: ${isCron})...`);

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
        await upsertVocabulary(vocab);
        // Note: We're counting all as "updated" since upsert doesn't distinguish
        // In a production app, we'd track this more precisely
        updatedWords++;
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
