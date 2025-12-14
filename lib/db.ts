import { sql } from '@vercel/postgres';
import { initializeDatabase } from './init-db';

export interface Vocabulary {
  id: number;
  vocab_de: string;
  vocab_en: string;
  artikel?: string;
  helping_verb?: string;
  type?: string;
  note?: string;
  example?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProgress {
  id: number;
  vocabulary_id: number;
  remembered: boolean;
  reviewed_at: Date;
}

export interface ReviewSchedule {
  id: number;
  vocabulary_id: number;
  scheduled_for: Date;
  times_forgotten: number;
  completed: boolean;
  created_at: Date;
}

// Upsert vocabulary into database
// Returns true if it was a new insert, false if it was an update
export async function upsertVocabulary(vocab: {
  vocab_de: string;
  vocab_en: string;
  artikel?: string;
  helping_verb?: string;
  type?: string;
  note?: string;
  example?: string;
}): Promise<boolean> {
  await initializeDatabase();
  
  // Check if the word already exists
  const existing = await sql`
    SELECT id FROM vocabulary 
    WHERE vocab_de = ${vocab.vocab_de} AND vocab_en = ${vocab.vocab_en}
    LIMIT 1
  `;
  
  const isNew = existing.rows.length === 0;
  
  await sql`
    INSERT INTO vocabulary (vocab_de, vocab_en, artikel, helping_verb, type, note, example, updated_at)
    VALUES (${vocab.vocab_de}, ${vocab.vocab_en}, ${vocab.artikel || null},
            ${vocab.helping_verb || null}, ${vocab.type || null},
            ${vocab.note || null}, ${vocab.example || null}, NOW())
    ON CONFLICT (vocab_de, vocab_en)
    DO UPDATE SET
      artikel = EXCLUDED.artikel,
      helping_verb = EXCLUDED.helping_verb,
      type = EXCLUDED.type,
      note = EXCLUDED.note,
      example = EXCLUDED.example,
      updated_at = NOW()
  `;
  
  return isNew;
}

// Get next flashcard to review
export async function getNextFlashcard(): Promise<Vocabulary | null> {
  await initializeDatabase();
  // First, try to get scheduled reviews for today
  const scheduledResult = await sql<Vocabulary>`
    SELECT DISTINCT v.*
    FROM vocabulary v
    INNER JOIN review_schedule rs ON v.id = rs.vocabulary_id
    WHERE rs.scheduled_for <= CURRENT_DATE
      AND rs.completed = FALSE
    ORDER BY rs.scheduled_for ASC, RANDOM()
    LIMIT 1
  `;

  if (scheduledResult.rows.length > 0) {
    return scheduledResult.rows[0];
  }

  // If no scheduled reviews, get a new word that hasn't been reviewed yet
  const newWordResult = await sql<Vocabulary>`
    SELECT v.*
    FROM vocabulary v
    WHERE NOT EXISTS (
      SELECT 1 FROM user_progress up 
      WHERE up.vocabulary_id = v.id
    )
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (newWordResult.rows.length > 0) {
    return newWordResult.rows[0];
  }

  // If all words have been reviewed, get any word that hasn't been reviewed recently
  // (fallback to show something)
  const anyWordResult = await sql<Vocabulary>`
    SELECT v.*
    FROM vocabulary v
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return anyWordResult.rows.length > 0 ? anyWordResult.rows[0] : null;
}

// Record user progress
export async function recordProgress(
  vocabularyId: number,
  remembered: boolean
): Promise<void> {
  await sql`
    INSERT INTO user_progress (vocabulary_id, remembered)
    VALUES (${vocabularyId}, ${remembered})
  `;
}

// Get times forgotten for a vocabulary word
export async function getTimesForgotten(vocabularyId: number): Promise<number> {
  const result = await sql<{ times_forgotten: number }>`
    SELECT COALESCE(MAX(times_forgotten), 0) as times_forgotten
    FROM review_schedule
    WHERE vocabulary_id = ${vocabularyId}
  `;

  return result.rows[0]?.times_forgotten || 0;
}

// Mark review schedule as completed
export async function completeReviewSchedule(vocabularyId: number): Promise<void> {
  await sql`
    UPDATE review_schedule
    SET completed = TRUE
    WHERE vocabulary_id = ${vocabularyId}
      AND scheduled_for <= CURRENT_DATE
      AND completed = FALSE
  `;
}

// Create review schedule entries
export async function createReviewSchedule(
  vocabularyId: number,
  days: number[],
  timesForgotten: number
): Promise<void> {
  // Delete any incomplete future schedules for this word
  await sql`
    DELETE FROM review_schedule
    WHERE vocabulary_id = ${vocabularyId}
      AND scheduled_for > CURRENT_DATE
      AND completed = FALSE
  `;

  // Insert new schedule entries
  for (const day of days) {
    await sql`
      INSERT INTO review_schedule (vocabulary_id, scheduled_for, times_forgotten)
      VALUES (${vocabularyId}, CURRENT_DATE + ${day}, ${timesForgotten})
    `;
  }
}

// Get statistics for the dashboard (future use)
export async function getStatistics() {
  const totalWords = await sql`SELECT COUNT(*) as count FROM vocabulary`;
  const reviewedToday = await sql`
    SELECT COUNT(DISTINCT vocabulary_id) as count
    FROM user_progress
    WHERE DATE(reviewed_at) = CURRENT_DATE
  `;
  const dueToday = await sql`
    SELECT COUNT(*) as count
    FROM review_schedule
    WHERE scheduled_for <= CURRENT_DATE AND completed = FALSE
  `;

  return {
    totalWords: totalWords.rows[0]?.count || 0,
    reviewedToday: reviewedToday.rows[0]?.count || 0,
    dueToday: dueToday.rows[0]?.count || 0,
  };
}
