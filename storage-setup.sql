-- Simplified storage setup for avatar uploads
-- This creates only the bucket - policies should be set up via Dashboard

-- Create the avatars bucket (this should work without special permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT 'Bucket created successfully' as status, * FROM storage.buckets WHERE id = 'avatars';

-- NOTE: After running this SQL, you need to set up RLS policies via the Supabase Dashboard:
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
