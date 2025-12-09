# FlashLingo 🇩🇪

A German vocabulary memorization web app that uses spaced repetition to help users learn vocabulary through flashcards.

## Features

- 📚 Flashcard-based learning interface
- 🔄 Spaced repetition system for optimal memorization
- 📊 Google Sheets integration for vocabulary management
- ⏰ Automatic daily sync from Google Sheets
- 🎯 Smart scheduling based on user performance
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** Vercel Postgres
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **External Integration:** Google Sheets API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Vercel account (for deployment)
- A Google Cloud project with Sheets API enabled
- A Google Service Account with access to your vocabulary sheet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FlashLingo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1-61Bfh0at--M8xcrphgNrgnyKTcqbctdjhY1Ib5-kOg
GOOGLE_SHEET_NAME=All
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Database Configuration (will be added after Vercel deployment)
POSTGRES_URL=your_postgres_url_here
```

4. Deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

5. Set up Vercel Postgres:

- Go to your Vercel project dashboard
- Navigate to Storage → Create Database → Postgres
- Copy the environment variables and add them to your project
- Run the database schema:

```bash
# Connect to your Vercel Postgres database and run schema.sql
```

Or use the Vercel Postgres dashboard SQL editor to run the contents of `schema.sql`.

6. Configure environment variables in Vercel:

- Go to your project settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy the project

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

**Note:** Local development requires a valid database connection. You can either:
- Use Vercel Postgres with the connection string
- Set up a local PostgreSQL database

## Google Sheets Setup

### Sheet Structure

Your Google Sheet should have the following columns (in this order):

| Column | Name | Description |
| --- | --- | --- |
| A | Vocab - DE | German word |
| B | Vocab - EN | English meaning |
| C | Artikel | der/die/das (for nouns) |
| D | Helping Verb | haben/sein (for verbs) |
| E | Type | noun/verb/adjective/adverb |
| F | Note | Optional notes |
| G | Example | German example sentence |

### Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create a new service account
   - Download the JSON key file
5. Share your Google Sheet with the service account email (Editor access)
6. Copy the entire JSON content and set it as `GOOGLE_SERVICE_ACCOUNT_JSON`

## Database Schema

The app uses three main tables:

- **vocabulary**: Stores German words with translations and metadata
- **user_progress**: Tracks each review attempt
- **review_schedule**: Manages spaced repetition schedule

See `schema.sql` for the complete schema.

## Spaced Repetition Algorithm

The app uses a simple but effective spaced repetition system:

**When user remembers:**
- Record success
- Mark current review as completed
- Move to next card

**When user forgets:**
- Record failure
- Create review schedule:
  - First 3 times forgotten: Review in 1, 3, and 5 days
  - After 3 times forgotten: Review in 7, 14, and 21 days

## API Routes

- `GET /api/flashcards` - Get the next flashcard to review
- `POST /api/progress` - Record user progress (remembered/forgot)
- `GET /api/sync-sheets` - Sync vocabulary from Google Sheets

## Cron Jobs

The app automatically syncs vocabulary from Google Sheets daily at 2 AM UTC using Vercel Cron Jobs.

You can also manually trigger a sync from the `/sync` page.

## Project Structure

```
flashlingo/
├── app/
│   ├── page.tsx                 # Flashcard interface
│   ├── sync/page.tsx            # Manual sync page
│   ├── api/
│   │   ├── sync-sheets/route.ts # Google Sheets sync
│   │   ├── flashcards/route.ts  # Get next card
│   │   └── progress/route.ts    # Record progress
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/
│   ├── db.ts                    # Database utilities
│   ├── google-sheets.ts         # Google Sheets client
│   └── spaced-repetition.ts     # SR algorithm
├── components/
│   ├── Flashcard.tsx            # Flashcard component
│   └── Header.tsx               # Navigation header
├── schema.sql                   # Database schema
├── vercel.json                  # Vercel configuration
└── package.json
```

## Deployment

The app is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Deploy your app
- Set up the cron job for daily syncs
- Provide a production URL

## Contributing

This is a personal learning project, but suggestions and feedback are welcome!

## License

MIT

## Author

Built with ❤️ for learning German vocabulary
