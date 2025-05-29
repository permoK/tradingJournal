-- Simplified storage setup for avatar uploads and trade screenshots
-- This creates the buckets - policies should be set up via Dashboard

-- Create the avatars bucket (this should work without special permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create the trade-screenshots bucket for trade images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  true,
  10485760, -- 10MB limit for trade screenshots
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create the strategy-images bucket for strategy images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'strategy-images',
  'strategy-images',
  true,
  5242880, -- 5MB limit for strategy images
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Verify the buckets were created
SELECT 'Avatars bucket created successfully' as status, * FROM storage.buckets WHERE id = 'avatars';
SELECT 'Trade screenshots bucket created successfully' as status, * FROM storage.buckets WHERE id = 'trade-screenshots';
SELECT 'Strategy images bucket created successfully' as status, * FROM storage.buckets WHERE id = 'strategy-images';

-- NOTE: After running this SQL, you need to set up RLS policies via the Supabase Dashboard:

-- AVATARS BUCKET POLICIES:
-- 1. Go to Storage > avatars bucket > Policies tab
-- 2. Add the following policies:
--
-- Policy 1 (SELECT): "Avatar images are publicly accessible"
-- Definition: true
--
-- Policy 2 (INSERT): "Users can upload their own avatar"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 3 (UPDATE): "Users can update their own avatar"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 4 (DELETE): "Users can delete their own avatar"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]

-- TRADE-SCREENSHOTS BUCKET POLICIES:
-- 1. Go to Storage > trade-screenshots bucket > Policies tab
-- 2. Add the following policies:
--
-- Policy 1 (SELECT): "Trade screenshots are publicly accessible"
-- Definition: true
--
-- Policy 2 (INSERT): "Users can upload their own trade screenshots"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 3 (UPDATE): "Users can update their own trade screenshots"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 4 (DELETE): "Users can delete their own trade screenshots"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]

-- STRATEGY-IMAGES BUCKET POLICIES:
-- 1. Go to Storage > strategy-images bucket > Policies tab
-- 2. Add the following policies:
--
-- Policy 1 (SELECT): "Strategy images are publicly accessible"
-- Definition: true
--
-- Policy 2 (INSERT): "Users can upload their own strategy images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 3 (UPDATE): "Users can update their own strategy images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 4 (DELETE): "Users can delete their own strategy images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
