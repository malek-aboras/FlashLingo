// Test script to verify Google Sheets connection
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

console.log('🔍 Google Sheets Connection Test\n');
console.log('='.repeat(60));

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

console.log('\n📋 Step 1: Environment Variables Check');
console.log('-'.repeat(60));

const sheetId = envVars.GOOGLE_SHEET_ID;
const sheetName = envVars.GOOGLE_SHEET_NAME;
const serviceAccountJson = envVars.GOOGLE_SERVICE_ACCOUNT_JSON;

console.log(`GOOGLE_SHEET_ID: ${sheetId ? '✅ SET (' + sheetId + ')' : '❌ NOT SET'}`);
console.log(`GOOGLE_SHEET_NAME: ${sheetName ? '✅ SET (' + sheetName + ')' : '❌ NOT SET'}`);
console.log(`GOOGLE_SERVICE_ACCOUNT_JSON: ${serviceAccountJson ? '✅ SET (length: ' + serviceAccountJson.length + ')' : '❌ NOT SET'}`);

if (!sheetId || !sheetName || !serviceAccountJson) {
  console.log('\n❌ Missing required environment variables!');
  process.exit(1);
}

console.log('\n📋 Step 2: Parse Service Account JSON');
console.log('-'.repeat(60));

let credentials;
try {
  credentials = JSON.parse(serviceAccountJson);
  console.log('✅ Valid JSON');
  console.log(`📧 Service Account Email: ${credentials.client_email || 'NOT FOUND'}`);
} catch (e) {
  console.log('❌ Invalid JSON:', e.message);
  process.exit(1);
}

console.log('\n📋 Step 3: Test Google Sheets API Connection');
console.log('-'.repeat(60));

async function testConnection() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${sheetName}!A:G`;

    console.log(`📊 Fetching data from: ${sheetName}!A:G`);
    console.log(`📄 Sheet ID: ${sheetId}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values || [];
    console.log(`\n✅ SUCCESS! Connected to Google Sheets`);
    console.log(`📈 Total rows found: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log(`\n📝 Header row (row 1):`);
      console.log(`   ${rows[0].join(' | ')}`);
      
      if (rows.length > 1) {
        const dataRows = rows.length - 1;
        console.log(`\n📚 Data rows: ${dataRows}`);
        console.log(`\n📝 First 3 data rows:`);
        for (let i = 1; i < Math.min(4, rows.length); i++) {
          console.log(`   Row ${i + 1}: ${rows[i].join(' | ')}`);
        }
      }
    } else {
      console.log('⚠️  Sheet is empty!');
    }
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n⚠️  PERMISSION ISSUE:');
      console.log(`   Make sure the Google Sheet is shared with:`);
      console.log(`   ${credentials.client_email}`);
      console.log(`   With at least "Viewer" access.`);
    } else if (error.message.includes('not found')) {
      console.log('\n⚠️  SHEET NOT FOUND:');
      console.log(`   Check if the Sheet ID is correct: ${sheetId}`);
      console.log(`   Check if the sheet name is correct: ${sheetName}`);
    }
    process.exit(1);
  }
}

testConnection().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
