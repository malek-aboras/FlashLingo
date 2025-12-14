import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

interface VocabularyRow {
  vocab_de: string;
  vocab_en: string;
  artikel?: string;
  helping_verb?: string;
  type?: string;
  note?: string;
  example?: string;
}

export async function fetchVocabularyFromSheets(): Promise<VocabularyRow[]> {
  try {
    const credentialsPath = path.join(process.cwd(), "google-profile.json");
    const credentialsFile = fs.readFileSync(credentialsPath, "utf8");
    const credentials = JSON.parse(credentialsFile);

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = `${process.env.GOOGLE_SHEET_NAME}!A:G`;

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const vocabularyData: VocabularyRow[] = [];

    // Skip header row (index 0) and process data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const vocab_de = row[0]?.trim();
      const vocab_en = row[1]?.trim();

      // Skip rows where German or English word is empty
      if (!vocab_de || !vocab_en) {
        continue;
      }

      vocabularyData.push({
        vocab_de,
        vocab_en,
        artikel: row[2]?.trim() || null,
        helping_verb: row[3]?.trim() || null,
        type: row[4]?.trim()?.toLowerCase() || null,
        note: row[5]?.trim() || null,
        example: row[6]?.trim() || null,
      });
    }

    return vocabularyData;
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    throw new Error("Failed to fetch vocabulary from Google Sheets");
  }
}
