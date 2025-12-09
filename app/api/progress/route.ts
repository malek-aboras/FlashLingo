import { NextRequest, NextResponse } from 'next/server';
import {
  recordProgress,
  completeReviewSchedule,
  createReviewSchedule,
  getTimesForgotten,
} from '@/lib/db';
import { calculateSpacingSchedule, shouldCreateNewSchedule } from '@/lib/spaced-repetition';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vocabularyId, remembered } = body;

    if (!vocabularyId || typeof remembered !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Required: vocabularyId (number) and remembered (boolean)',
        },
        { status: 400 }
      );
    }

    // Record the progress
    await recordProgress(vocabularyId, remembered);

    if (remembered) {
      // User remembered: just mark the current schedule as completed
      await completeReviewSchedule(vocabularyId);
    } else {
      // User forgot: create new review schedule
      const currentTimesForgotten = await getTimesForgotten(vocabularyId);
      const schedule = calculateSpacingSchedule(currentTimesForgotten);

      await createReviewSchedule(
        vocabularyId,
        schedule.days,
        schedule.timesForgotten
      );
    }

    return NextResponse.json({
      success: true,
      message: remembered
        ? 'Progress recorded: remembered'
        : 'Progress recorded: forgot, scheduled for review',
    });
  } catch (error) {
    console.error('Error recording progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
