-- Migration to add privacy support to strategies
-- This script adds the is_private field to the strategies table and creates the necessary RLS policy

-- Add is_private column to strategies table
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Add policy to allow users to view public strategies
CREATE POLICY "Users can view public strategies" ON strategies
  FOR SELECT USING (is_private = false);

-- Note: The existing "Users can view own strategies" policy will still work
-- Both policies will be evaluated with OR logic, so users can see their own strategies and public ones
