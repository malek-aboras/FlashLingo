# Database Setup Script

This directory contains scripts for setting up and managing the FlashLingo database.

## setup-database.js

Sets up the Neon PostgreSQL database tables using the connection string from environment variables.

### Prerequisites

1. Make sure you have your `.env` file with the `POSTGRES_URL` variable set:
   ```
   POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Usage

Run the setup script:

```bash
npm run setup-db
```

Or directly with Node:

```bash
node scripts/setup-database.js
```

### What it does

The script will:
1. Connect to your Neon database using the `POSTGRES_URL` from your environment
2. Create the following tables:
   - `vocabulary` - Stores German words with translations and metadata
   - `user_progress` - Tracks each review attempt
   - `review_schedule` - Manages spaced repetition schedule
3. Create indexes for optimal query performance
4. Verify that all tables were created successfully

### Troubleshooting

**Error: POSTGRES_URL environment variable is not set**
- Make sure you have a `.env` file in the root directory
- Ensure the `POSTGRES_URL` variable is set with your Neon connection string

**Connection errors**
- Verify your Neon database is running
- Check that your connection string is correct
- Ensure your IP is allowlisted in Neon (if IP restrictions are enabled)

**SQL errors**
- The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- If tables already exist, the script will not modify them
