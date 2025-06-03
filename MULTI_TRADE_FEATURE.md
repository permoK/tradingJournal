# Multi-Trade Recording Feature

## Overview
The trading journal now supports recording multiple trades before saving them all at once. This feature allows users to:

1. **Add multiple trades** to a temporary list
2. **Upload images** for each trade (screenshots, charts, etc.)
3. **Edit or delete** saved trades before recording
4. **Record all trades** at once to the database
5. **View saved trades** with visual cards showing trade details

## New Components

### 1. ImageUpload Component (`src/components/ImageUpload.tsx`)
- Handles image uploads to Supabase storage
- Supports drag & drop and click to upload
- Validates file types and sizes (max 10MB)
- Shows preview of uploaded images
- Uses the `trade-screenshots` storage bucket

### 2. SavedTradeCard Component (`src/components/SavedTradeCard.tsx`)
- Displays individual saved trades in a card format
- Shows trade details, P/L calculations, and screenshots
- Provides edit and delete actions
- Color-coded for profit/loss visualization

### 3. SavedTradesList Component (`src/components/SavedTradesList.tsx`)
- Container for all saved trades
- Shows total P/L across all saved trades
- Provides "Record All Trades" and "Clear All" actions
- Responsive grid layout for trade cards

## Updated Features

### Enhanced New Trade Page (`src/app/trading/new/page.tsx`)
- **Multi-trade workflow**: Add trades to a temporary list instead of immediate recording
- **Image upload**: Each trade can have an associated screenshot
- **Edit functionality**: Click edit on any saved trade to modify it
- **Batch recording**: Record all saved trades with a single action
- **Local storage**: Saved trades persist across browser sessions until recorded
- **P/L calculation**: Real-time profit/loss calculation for closed trades

### Updated Hooks (`src/lib/hooks.ts`)
- **createMultipleTrades**: New function to create multiple trades in a single database transaction
- **Batch operations**: Efficient handling of multiple trade insertions

## Storage Setup

### New Storage Bucket
A new `trade-screenshots` bucket has been added to store trade images:

```sql
-- Create the trade-screenshots bucket for trade images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  true,
  10485760, -- 10MB limit for trade screenshots
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;
```

### Required Storage Policies
You need to set up RLS policies in your Supabase Dashboard:

1. Go to Storage > trade-screenshots bucket > Policies tab
2. Add these policies:
   - **SELECT**: "Trade screenshots are publicly accessible" - Definition: `true`
   - **INSERT**: "Users can upload their own trade screenshots" - Definition: `auth.uid()::text = (storage.foldername(name))[1]`
   - **UPDATE**: "Users can update their own trade screenshots" - Definition: `auth.uid()::text = (storage.foldername(name))[1]`
   - **DELETE**: "Users can delete their own trade screenshots" - Definition: `auth.uid()::text = (storage.foldername(name))[1]`

## Database Schema
The existing `trades` table already supports the `screenshot_url` field, so no database changes are required.

## User Workflow

### 1. Adding Trades
1. Navigate to `/trading/new`
2. Fill in trade details (market, type, prices, etc.)
3. Optionally upload a screenshot
4. Click "Add Trade" to save to the temporary list
5. Repeat for additional trades

### 2. Managing Saved Trades
- **View**: All saved trades appear in cards below the form
- **Edit**: Click the edit icon on any trade card to modify it
- **Delete**: Click the delete icon to remove a trade from the list
- **Clear All**: Remove all saved trades at once

### 3. Recording Trades
1. Review all saved trades in the list
2. Check the total P/L summary
3. Click "Record All Trades" to save to the database
4. All trades are recorded and you're redirected to the trades page

## Technical Details

### Local Storage
- Saved trades are stored in `localStorage` under the key `savedTrades`
- Data persists across browser sessions until recorded
- Automatically cleared after successful recording

### Image Handling
- Images are uploaded immediately when selected
- URLs are stored with the trade data
- Failed uploads show error messages
- Images are displayed in trade cards and detail views

### Error Handling
- Validation for required fields
- File type and size validation for images
- Network error handling for uploads and recording
- User-friendly error messages

## Benefits

1. **Batch Efficiency**: Record multiple trades in one database transaction
2. **Visual Documentation**: Attach screenshots to trades for better record-keeping
3. **Flexible Workflow**: Add, edit, and review trades before committing
4. **Data Persistence**: Saved trades survive browser refreshes
5. **Better UX**: Clear visual feedback and intuitive interface
