# Authentication Setup Guide

This guide will help you set up authentication for your Deriv Progress Tracker app using Supabase.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "deriv-progress-tracker")
5. Enter a database password
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon, public)

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 4. Configure Authentication Providers (Optional)

#### Google OAuth
1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

#### GitHub OAuth
1. In Supabase dashboard, go to Authentication > Providers
2. Enable GitHub provider
3. Add your GitHub OAuth credentials

### 5. Set Up Database Tables

The app expects certain database tables for user profiles and data. You can set these up in the Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  streak_count INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Configure URL Redirects

In your Supabase dashboard:

1. Go to Authentication > URL Configuration
2. Add the following URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

For production, replace `localhost:3000` with your actual domain.

## Features Included

✅ **Email/Password Authentication**
- User registration with email verification
- Secure login with password
- Password strength validation

✅ **Social Authentication**
- Google OAuth integration
- GitHub OAuth integration
- One-click social login

✅ **Password Management**
- Forgot password functionality
- Secure password reset via email
- Password update capability

✅ **User Experience**
- Responsive design for all devices
- Loading states and error handling
- Form validation and feedback
- Automatic redirects after authentication

✅ **Security Features**
- Protected routes with middleware
- Row Level Security (RLS) in database
- Secure session management
- CSRF protection

## Usage

### Authentication Pages

- **Login**: `/auth/login`
- **Register**: `/auth/register`
- **Forgot Password**: `/auth/forgot-password`
- **Reset Password**: `/auth/reset-password`
- **Email Verification**: `/auth/verify-email`

### Using the Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check that your environment variables are correct
2. **"Email not confirmed"**: Check your email for verification link
3. **OAuth not working**: Verify OAuth provider configuration in Supabase
4. **Redirect loops**: Check your URL configuration in Supabase

### Development Tips

- Use the Supabase dashboard to monitor authentication events
- Check the browser console for detailed error messages
- Verify that your `.env.local` file is not committed to version control

## Production Deployment

1. Update environment variables with production URLs
2. Configure production redirect URLs in Supabase
3. Set up proper email templates in Supabase
4. Consider enabling additional security features like MFA

## Support

For issues with this authentication setup, please check:
1. [Supabase Documentation](https://supabase.com/docs)
2. [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
3. Project issues on GitHub
