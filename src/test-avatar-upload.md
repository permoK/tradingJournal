# Avatar Upload Testing Guide

## Manual Testing Steps

### 1. Test Profile Avatar Upload

1. **Navigate to Settings Page**
   - Go to http://localhost:3000/settings
   - Click on "Profile Settings" tab
   - Verify the current avatar is displayed

2. **Test Avatar Upload**
   - Click the camera icon on the avatar
   - Select a valid image file (JPEG, PNG, WebP under 5MB)
   - Verify the preview appears immediately
   - Click "Update Profile" to save
   - Check that the avatar is uploaded to Backblaze B2
   - Verify the profile is updated with the new avatar URL

3. **Test Avatar Validation**
   - Try uploading an invalid file type (e.g., .txt, .pdf)
   - Verify error message appears
   - Try uploading a file larger than 5MB
   - Verify size error message appears

4. **Test Avatar Removal**
   - Upload an avatar first
   - Click "Remove selected photo"
   - Verify the preview is cleared
   - Save the profile and verify avatar is removed

### 2. Test Google OAuth Avatar Import

1. **Sign Out and Test Google OAuth**
   - Sign out of the current account
   - Go to login page
   - Click "Sign in with Google"
   - Use a Google account with a profile picture

2. **Verify Avatar Import**
   - After successful login, check the profile settings
   - Verify the Google profile picture was downloaded and uploaded to Backblaze B2
   - Check that the avatar URL points to the Backblaze B2 domain
   - Verify the avatar displays correctly in the app

### 3. Test Avatar Migration

1. **Test Existing User Avatar Migration**
   - For users with existing Google avatars (external URLs)
   - Sign in again with Google OAuth
   - Verify the external avatar URL is migrated to Backblaze B2
   - Check that the old external URL is replaced

## API Endpoints to Test

### Avatar Upload API
```bash
# Test avatar upload (requires authentication)
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/test-image.jpg"
```

### Avatar Deletion API
```bash
# Test avatar deletion (requires authentication)
curl -X DELETE http://localhost:3000/api/upload/avatar
```

## Expected Behaviors

### ✅ Successful Avatar Upload
- File is validated (type, size)
- Image is uploaded to Backblaze B2 in `avatars/` folder
- Profile is updated with new avatar URL
- Success notification is shown
- Avatar displays immediately

### ✅ Google OAuth Avatar Import
- Google profile image is downloaded
- Image is uploaded to Backblaze B2
- Profile is created/updated with Backblaze URL
- Avatar displays in the app

### ✅ Error Handling
- Invalid file types show appropriate error
- Large files show size limit error
- Network errors are handled gracefully
- User sees helpful error messages

## File Structure

```
avatars/
├── {userId}-{timestamp}-{filename}.jpg
├── {userId}-{timestamp}-avatar.jpg
└── ...
```

## Environment Variables Required

```env
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=your_bucket_name
B2_BUCKET_ID=your_bucket_id
NEXT_PUBLIC_B2_DOWNLOAD_URL=https://your-bucket-url
```

## Troubleshooting

### Common Issues
1. **Backblaze B2 Configuration**: Ensure all B2 environment variables are set
2. **File Permissions**: Check that the upload API has proper authentication
3. **CORS Issues**: Verify Backblaze B2 CORS settings if needed
4. **File Size**: Ensure test images are under 5MB limit

### Debug Steps
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify Backblaze B2 bucket permissions
4. Test with different image formats and sizes
