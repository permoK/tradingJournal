-- Migration to fix community features
-- This script adds the necessary RLS policy to allow users to view all profiles for community features

-- Add policy to allow users to view all profiles for community features
-- This is safe because profile information is meant to be public in a community context
CREATE POLICY "Users can view all profiles for community" ON profiles
  FOR SELECT USING (true);

-- Note: The existing "Users can view own profile" policy will still work
-- Both policies will be evaluated with OR logic, so users can see all profiles
