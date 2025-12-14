# 🔍 FlashLingo Google Sheets Sync - Debugging Guide

## ✅ What We've Verified

### Step 1: Environment Variables ✅
- ✅ `GOOGLE_SHEET_ID` is set correctly
- ✅ `GOOGLE_SHEET_NAME` is set to "All"
- ✅ `GOOGLE_SERVICE_ACCOUNT_JSON` is valid

### Step 2: Google Sheets Connection ✅
- ✅ Successfully connected to Google Sheets API
- ✅ Found **911 rows** in your Google Sheet (1 header + 910 data rows)
- ✅ Service account email: `flashlingo-sheets@flashlingo-480519.iam.gserviceaccount.com`

### Step 3: Sync Endpoint ✅
- ✅ Sync endpoint is working
- ✅ Successfully imported **910 words** from Google Sheets

## 🔍 Current Situation

**The Issue:** Your database currently shows only 10 rows, but the sync imported 910 words.

**Possible Reasons:**
1. **Pagination in Database Viewer** - The database UI might be showing only the first page (10 rows)
2. **Data Already Synced** - The words might already be in the database
3. **View Filter** - The database viewer might have filters applied

## 📋 Step-by-Step Solution

### Option A: Verify Data is Actually There

1. **Check Database Row Count:**
   - In your Vercel database viewer, look for pagination controls
   - Change "50 items per page" to see more rows
   - Or check the total row count at the bottom

2. **Test in the App:**
   - Go to http://localhost:3000
   - The app should show flashcards from your Google Sheets data
   - If you see words like "Einfach", "Bisschen", "Schnell" - those are from your sheet!

### Option B: Clear and Re-sync (If Needed)

If you want to start fresh:

1. **Clear existing data** (optional - only if you want fresh start):
   ```sql
   -- Run this in your database SQL editor
   DELETE FROM review_schedule;
   DELETE FROM user_progress;
   DELETE FROM vocabulary;
   ```

2. **Re-sync from Google Sheets:**
   - Visit: http://localhost:3000/sync
   - Click "Sync Now"
   - Or use: http://localhost:3000/api/sync-sheets

### Option C: Verify Google Sheet Access

Make sure your Google Sheet is shared with the service account:
- Email: `flashlingo-sheets@flashlingo-480519.iam.gserviceaccount.com`
- Permission: At least "Viewer" access (Editor is better)

## 🧪 Test Commands

### Test 1: Check Sync Status
```bash
curl http://localhost:3000/api/sync-sheets
```

### Test 2: Get Next Flashcard
```bash
curl http://localhost:3000/api/flashcards
```

### Test 3: Check Database Connection
The app should automatically connect. Check server logs for any errors.

## 🎯 Next Steps

1. **Check your app at http://localhost:3000**
   - Do you see flashcards?
   - Are they from your Google Sheet?

2. **Check database pagination**
   - In Vercel database viewer, navigate through pages
   - Look for total row count

3. **If data is missing:**
   - Run the sync again: http://localhost:3000/sync
   - Check server console for errors

## 📊 Expected Results

After successful sync:
- ✅ Database should have ~910 vocabulary entries
- ✅ App should show flashcards from your Google Sheet
- ✅ Words should match your sheet (e.g., "Einfach", "Bisschen", "Schnell")

## 🐛 Common Issues

### Issue 1: "No vocabulary data found"
- **Cause:** Google Sheet is empty or not accessible
- **Fix:** Verify sheet sharing and check sheet has data

### Issue 2: "Permission denied"
- **Cause:** Service account doesn't have access
- **Fix:** Share sheet with `flashlingo-sheets@flashlingo-480519.iam.gserviceaccount.com`

### Issue 3: "Sheet not found"
- **Cause:** Wrong Sheet ID or Sheet Name
- **Fix:** Verify `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_NAME` in `.env.local`

## ✅ Verification Checklist

- [ ] Environment variables are set correctly
- [ ] Google Sheets connection works (test script passed)
- [ ] Sync endpoint returns success
- [ ] Database has vocabulary data
- [ ] App shows flashcards from Google Sheets
- [ ] Words match your Google Sheet content


