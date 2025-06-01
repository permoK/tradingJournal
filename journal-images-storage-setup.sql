-- Journal Images Storage Setup
-- This creates the journal-images bucket and sets up RLS policies

-- Create the journal-images bucket for journal entry images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journal-images',
  'journal-images',
  true,
  5242880, -- 5MB limit for journal images
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT 'Journal images bucket created successfully' as status, * FROM storage.buckets WHERE id = 'journal-images';

-- NOTE: After running this SQL, you need to set up RLS policies via the Supabase Dashboard:

-- JOURNAL-IMAGES BUCKET POLICIES:
-- 1. Go to Storage > journal-images bucket > Policies tab
-- 2. Add the following policies:
--
-- Policy 1 (SELECT): "Journal images are publicly accessible"
-- Definition: true
--
-- Policy 2 (INSERT): "Users can upload their own journal images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 3 (UPDATE): "Users can update their own journal images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 4 (DELETE): "Users can delete their own journal images"
-- Definition: auth.uid()::text = (storage.foldername(name))[1]

-- Alternative: If you prefer to set up policies via SQL (requires proper permissions):
-- Note: These policies may need to be created via the Supabase Dashboard instead

-- CREATE POLICY "Journal images are publicly accessible" ON storage.objects
--   FOR SELECT USING (bucket_id = 'journal-images');

-- CREATE POLICY "Users can upload their own journal images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'journal-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can update their own journal images" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'journal-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own journal images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'journal-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
