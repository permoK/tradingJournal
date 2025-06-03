# Username Setup Flow for Google OAuth

This document explains the new username setup flow implemented for users signing up with Google OAuth.

## Overview

When users sign up with Google OAuth, they don't provide a username during the initial authentication process. This implementation adds a username selection step after successful Google authentication.

## Flow Description

### 1. Google OAuth Authentication
- User clicks "Sign in with Google" on login/register page
- User is redirected to Google for authentication
- Google redirects back to `/auth/callback` with authorization code

### 2. Auth Callback Processing
- `/auth/callback` exchanges the authorization code for a session
- Checks if the user has a username in their profile
- If no username exists or username is empty:
  - Redirects to `/auth/setup-username`
- If username exists:
  - Redirects to `/dashboard` (or specified next URL)

### 3. Username Setup
- User is presented with a username selection form
- Real-time username availability checking as user types
- Username validation (3-20 characters, letters/numbers/underscores only)
- Visual feedback for availability and validation
- After successful username setup, redirects to dashboard

## Files Modified/Created

### Modified Files
1. **`src/app/auth/callback/route.ts`**
   - Added username checking logic
   - Redirects to username setup if needed

2. **`src/middleware.ts`**
   - Added `/auth/setup-username` to special auth routes
   - Prevents redirect loops for authenticated users on setup page

3. **`database-schema.sql`**
   - Updated trigger to handle OAuth user metadata better
   - Includes avatar_url from OAuth providers

### New Files
1. **`src/app/auth/setup-username/page.tsx`**
   - Username selection interface
   - Real-time validation and availability checking
   - Responsive design matching app theme

2. **`src/app/api/auth/check-username/route.ts`**
   - API endpoint for checking username availability
   - Validates username format
   - Returns availability status

3. **`src/app/api/auth/set-username/route.ts`**
   - API endpoint for setting user's username
   - Creates or updates user profile
   - Handles duplicate username errors

## API Endpoints

### POST `/api/auth/check-username`
**Request Body:**
```json
{
  "username": "desired_username"
}
```

**Response:**
```json
{
  "available": true
}
```

### POST `/api/auth/set-username`
**Request Body:**
```json
{
  "username": "chosen_username"
}
```

**Response:**
```json
{
  "success": true,
  "profile": { ... }
}
```

## Username Validation Rules

- **Length:** 3-20 characters
- **Characters:** Letters (a-z, A-Z), numbers (0-9), and underscores (_)
- **Uniqueness:** Must not already exist in the database
- **Format:** No spaces or special characters except underscore

## User Experience Features

1. **Real-time Validation:** Username is validated as user types
2. **Availability Checking:** Debounced API calls to check availability
3. **Visual Feedback:** Icons and colors indicate validation status
4. **Error Handling:** Clear error messages for various scenarios
5. **Loading States:** Proper loading indicators during API calls
6. **Responsive Design:** Works on all device sizes

## Security Considerations

1. **Authentication Required:** All username APIs require valid session
2. **Input Validation:** Server-side validation of username format
3. **Rate Limiting:** Debounced client-side requests prevent spam
4. **SQL Injection Protection:** Parameterized queries used
5. **Unique Constraints:** Database enforces username uniqueness

## Testing the Flow

1. **Setup:** Ensure Google OAuth is configured in Supabase
2. **Test New User:** Sign up with Google account that hasn't been used
3. **Verify Redirect:** Should redirect to username setup page
4. **Test Validation:** Try various username formats
5. **Test Availability:** Try existing and new usernames
6. **Complete Setup:** Choose valid username and verify dashboard redirect

## Troubleshooting

### Common Issues
1. **Redirect Loop:** Check middleware configuration
2. **Username Not Saving:** Verify database permissions
3. **OAuth Errors:** Check Supabase OAuth configuration
4. **API Errors:** Check server logs for detailed error messages

### Debug Steps
1. Check browser network tab for API responses
2. Verify Supabase auth configuration
3. Check database for profile creation
4. Review server logs for errors
