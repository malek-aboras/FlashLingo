/**
 * Spaced Repetition Algorithm for FlashLingo
 *
 * Rules:
 * - When user remembers: Move to next card
 * - When user forgets:
 *   - If forgotten < 3 times: Schedule for +1, +3, +5 days
 *   - If forgotten >= 3 times: Schedule for +7, +14, +21 days
 */

export interface SpacingSchedule {
  days: number[];
  timesForgotten: number;
}

export function calculateSpacingSchedule(
  currentTimesForgotten: number
): SpacingSchedule {
  const newTimesForgotten = currentTimesForgotten + 1;

  if (newTimesForgotten < 3) {
    // Initial learning phase: review soon
    return {
      days: [1, 3, 5],
      timesForgotten: newTimesForgotten,
    };
  } else {
    // Extended review phase: longer intervals
    return {
      days: [7, 14, 21],
      timesForgotten: newTimesForgotten,
    };
  }
}

export function shouldCreateNewSchedule(remembered: boolean): boolean {
  // Only create new schedule when user forgets
  return !remembered;
}
