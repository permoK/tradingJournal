# Backblaze B2 Storage Setup Guide

This guide will help you set up Backblaze B2 storage for your trading journal app.

## Step 1: Create a Backblaze Account

1. Go to [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)
2. Sign up for an account or log in if you already have one
3. Navigate to the B2 Cloud Storage section

## Step 2: Create a Bucket

1. In your Backblaze dashboard, go to **B2 Cloud Storage** > **Buckets**
2. Click **Create a Bucket**
3. Choose a unique bucket name (e.g., `your-app-name-storage`)
4. Set **Files in Bucket are** to **Public** (for easy image access)
5. Click **Create a Bucket**
6. Note down your **Bucket Name** and **Bucket ID**

## Step 3: Create Application Keys

1. Go to **App Keys** in your Backblaze dashboard
2. Click **Add a New Application Key**
3. Configure the key:
   - **Name of Key**: Give it a descriptive name (e.g., "Trading Journal App")
   - **Allow access to Bucket(s)**: Select your bucket or choose "All"
   - **Type of Access**: Choose "Read and Write"
   - **Allow List All Bucket Names**: Check this box
4. Click **Create New Key**
5. **IMPORTANT**: Copy the **keyID** and **applicationKey** immediately - you won't be able to see the applicationKey again!

## Step 4: Update Environment Variables

Update your `.env.local` file with your Backblaze credentials:

```env
# Backblaze B2 Storage Configuration
B2_APPLICATION_KEY_ID=your_key_id_here
B2_APPLICATION_KEY=your_application_key_here
B2_BUCKET_NAME=your_bucket_name_here
B2_BUCKET_ID=your_bucket_id_here
NEXT_PUBLIC_B2_DOWNLOAD_URL=https://f000.backblazeb2.com/file/your_bucket_name_here
```

### How to find these values:

- **B2_APPLICATION_KEY_ID**: The keyID from Step 3
- **B2_APPLICATION_KEY**: The applicationKey from Step 3
- **B2_BUCKET_NAME**: The bucket name from Step 2
- **B2_BUCKET_ID**: Found in your bucket details page
- **NEXT_PUBLIC_B2_DOWNLOAD_URL**: Replace `your_bucket_name_here` with your actual bucket name

## Step 5: Test the Integration

1. Restart your development server: `npm run dev`
2. Navigate to any page with image upload (e.g., New Trade, New Journal Entry)
3. Try uploading an image
4. Check your Backblaze bucket to see if the file was uploaded

## Folder Structure

The app organizes files in folders based on the bucket parameter:

- `trade-screenshots/` - Trade images
- `journal-images/` - Journal entry images  
- `strategy-images/` - Strategy images
- `avatars/` - User profile pictures

## Security Features

- **Authentication Required**: Only authenticated users can upload files
- **File Validation**: Only image files (JPEG, PNG, WebP, GIF) are allowed
- **Size Limits**: Configurable per upload type (default 10MB)
- **User Isolation**: Users can only delete their own files
- **Unique Filenames**: Prevents conflicts and adds security

## Pricing

Backblaze B2 is very cost-effective:
- **Storage**: $0.005/GB/month
- **Downloads**: $0.01/GB (first 1GB free daily)
- **API Calls**: First 2,500 free daily

For a typical trading journal app, costs should be minimal.

## Troubleshooting

### Common Issues:

1. **"Backblaze B2 credentials not configured"**
   - Check that all environment variables are set correctly
   - Restart your development server after updating `.env.local`

2. **"Failed to authorize with Backblaze B2"**
   - Verify your Application Key ID and Application Key are correct
   - Make sure the key has the right permissions

3. **"Upload failed"**
   - Check file size (must be under the limit)
   - Verify file type is supported (JPEG, PNG, WebP, GIF)
   - Check browser console for detailed error messages

4. **Images not displaying**
   - Verify your `NEXT_PUBLIC_B2_DOWNLOAD_URL` is correct
   - Make sure your bucket is set to Public

### Getting Help:

- Check the browser console for detailed error messages
- Look at the server logs in your terminal
- Verify your Backblaze dashboard shows the uploaded files

## Migration from Supabase

If you were previously using Supabase storage, you can:

1. Keep existing Supabase images (they'll continue to work)
2. New uploads will go to Backblaze
3. Optionally migrate existing images to Backblaze manually

The app will handle both Supabase and Backblaze URLs seamlessly.
