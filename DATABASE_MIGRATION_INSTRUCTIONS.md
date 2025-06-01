# Database Migration Instructions

## 🚨 IMPORTANT: Run This Migration Script

If you're experiencing issues with public strategies not being visible to other users, or any other database-related problems, you likely need to run the complete database migration script.

## How to Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Migration Script
1. Open the file `complete-database-migration.sql` in your code editor
2. **Copy the entire contents** of the file
3. **Paste it into the Supabase SQL Editor**
4. Click **"Run"** to execute the script

### Step 3: Verify Success
The script will show verification messages at the end. You should see:
- ✅ Tables created successfully
- ✅ Required columns verified  
- ✅ Storage buckets verified
- ✅ Database migration completed successfully!

## What This Migration Does

### 🔧 **Fixes Current Issues**
- **Public Strategies Visibility**: Ensures all public strategies are visible to community members
- **Demo/Real Trade Separation**: Properly handles demo vs real trade filtering
- **Row Level Security**: Sets up correct permissions for all features

### 📊 **Database Schema Updates**
- Creates all required tables if they don't exist
- Adds missing columns (`is_demo`, `is_private`)
- Updates existing data to have correct default values
- Sets up proper foreign key relationships

### 🔒 **Security Policies**
- **Profiles**: Users can view all profiles (needed for community features)
- **Strategies**: Users can view their own + public strategies from others
- **Trades**: Users can view their own + public trades from others  
- **Journals**: Users can view their own + public journal entries from others

### 📁 **Storage Buckets**
- **avatars**: For user profile pictures (5MB limit)
- **trade-screenshots**: For trade images (10MB limit)
- **strategy-images**: For strategy screenshots (5MB limit)

### ⚙️ **Functions & Triggers**
- Automatic profile creation when users sign up
- Proper handling of OAuth user metadata

## Safety Features

✅ **Safe to run multiple times** - The script uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
✅ **No data loss** - Only adds missing structure, doesn't delete existing data
✅ **Backwards compatible** - Existing functionality continues to work
✅ **Verification included** - Shows what was created/updated

## After Running the Migration

### 1. Test Community Features
- Go to `/community` page
- Check that public strategies from other users are visible
- Verify that your own public strategies appear to others

### 2. Test Demo/Real Trade Separation  
- Switch between demo and real modes
- Verify that trades are properly filtered
- Check that public strategies only show real trade performance

### 3. Test File Uploads
- Try uploading a profile picture
- Upload trade screenshots
- Upload strategy images

## Troubleshooting

### If the script fails:
1. **Check permissions**: Make sure you're the project owner or have SQL access
2. **Run in sections**: You can run parts of the script separately if needed
3. **Check existing policies**: Some policies might already exist (this is normal)

### If you still have issues:
1. Check the browser console for any JavaScript errors
2. Verify your `.env.local` file has correct Supabase credentials
3. Make sure your Supabase project is active and not paused

## Files Included

- `complete-database-migration.sql` - The main migration script
- `migration-add-is-demo.sql` - Legacy demo trades migration (included in main script)
- `database-migration-community-fix.sql` - Legacy community fix (included in main script)
- `storage-setup.sql` - Legacy storage setup (included in main script)

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Look for error messages in the SQL Editor
3. Verify your database connection is working
4. Make sure you have the latest code changes deployed

---

**Remember**: This migration script fixes the public strategies visibility issue and ensures your database is fully up to date with all the latest features!
