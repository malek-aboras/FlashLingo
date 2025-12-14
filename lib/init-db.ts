import { sql } from '@vercel/postgres';

let isInitialized = false;

export async function initializeDatabase(): Promise<void> {
  // Only initialize once per deployment
  if (isInitialized) {
    return;
  }

  try {
    console.log('Initializing database schema...');

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

    // Create user_progress table
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
        remembered BOOLEAN NOT NULL,
        reviewed_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create review_schedule table
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

    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw - let the app continue, but log the error
    // This allows the app to work even if schema already exists
  }
}
