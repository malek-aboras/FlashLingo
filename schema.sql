-- FlashLingo Database Schema

-- Vocabulary table: stores German words with translations and metadata
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
);

-- User progress table: tracks each review attempt
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  remembered BOOLEAN NOT NULL,
  reviewed_at TIMESTAMP DEFAULT NOW()
);

-- Review schedule table: manages spaced repetition schedule
CREATE TABLE IF NOT EXISTS review_schedule (
  id SERIAL PRIMARY KEY,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  scheduled_for DATE NOT NULL,
  times_forgotten INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_type ON vocabulary(type);
CREATE INDEX IF NOT EXISTS idx_user_progress_vocabulary ON user_progress(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_review_schedule_date ON review_schedule(scheduled_for, completed);
CREATE INDEX IF NOT EXISTS idx_review_schedule_vocabulary ON review_schedule(vocabulary_id);
