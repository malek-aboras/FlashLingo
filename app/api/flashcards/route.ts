import { NextResponse } from 'next/server';
import { getNextFlashcard } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const flashcard = await getNextFlashcard();

    if (!flashcard) {
      return NextResponse.json({
        success: true,
        message: "You're done for today!",
        card: null,
      });
    }

    return NextResponse.json({
      success: true,
      card: {
        id: flashcard.id,
        vocab_de: flashcard.vocab_de,
        vocab_en: flashcard.vocab_en,
        artikel: flashcard.artikel,
        helping_verb: flashcard.helping_verb,
        type: flashcard.type,
        note: flashcard.note,
        example: flashcard.example,
      },
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);

    // Check if error is related to missing database tables
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTableMissingError = errorMessage.includes('relation') &&
                                 errorMessage.includes('does not exist');

    if (isTableMissingError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not initialized',
          details: 'Database tables do not exist. Please run the database setup first by visiting /api/setup',
          needsSetup: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch flashcard',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
