-- Complete Database Migration Script
-- Run this script in your Supabase SQL Editor to ensure your database is fully up to date
-- This script is safe to run multiple times (idempotent)

-- ============================================================================
-- STEP 1: ENSURE ALL TABLES EXIST WITH CORRECT SCHEMA
-- ============================================================================

-- Enable Row Level Security on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  streak_count INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance NUMERIC DEFAULT 10000
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  details TEXT,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  profitable_trades INTEGER DEFAULT 0
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  trade_ids UUID[] DEFAULT '{}',
  strategy_ids UUID[] DEFAULT '{}'
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  trade_date TIMESTAMP WITH TIME ZONE NOT NULL,
  market TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  entry_price DECIMAL(15,8) NOT NULL,
  exit_price DECIMAL(15,8),
  quantity DECIMAL(15,8) NOT NULL,
  profit_loss DECIMAL(15,2),
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  notes TEXT,
  screenshot_url TEXT,
  is_private BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false
);

-- Create activity_logs table for streak tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('learning', 'trading', 'journal')),
  activity_title TEXT NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS (SAFE TO RUN MULTIPLE TIMES)
-- ============================================================================

-- Add is_private column to strategies if it doesn't exist
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Add is_demo column to trades if it doesn't exist
ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add image_url column to journal_entries if it doesn't exist
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add trade_ids column to journal_entries if it doesn't exist
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS trade_ids UUID[] DEFAULT '{}';

-- Add strategy_ids column to journal_entries if it doesn't exist
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS strategy_ids UUID[] DEFAULT '{}';

-- Add strategy duplication support columns
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS original_strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS duplicate_count INTEGER DEFAULT 0;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false;

-- Update existing trades to be real trades (not demo) if they have NULL values
UPDATE trades SET is_demo = false WHERE is_demo IS NULL;

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: DROP EXISTING POLICIES (TO AVOID CONFLICTS)
-- ============================================================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles for community" ON profiles;

DROP POLICY IF EXISTS "Users can view own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can view public strategies" ON strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON strategies;

DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can view public journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

DROP POLICY IF EXISTS "Users can view own trades" ON trades;
DROP POLICY IF EXISTS "Users can view public trades" ON trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
DROP POLICY IF EXISTS "Users can update own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON trades;

DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can update own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can delete own activity logs" ON activity_logs;

-- ============================================================================
-- STEP 5: CREATE ALL REQUIRED POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- IMPORTANT: Allow users to view all profiles for community features
CREATE POLICY "Users can view all profiles for community" ON profiles
  FOR SELECT USING (true);

-- Strategies policies
CREATE POLICY "Users can view own strategies" ON strategies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public strategies" ON strategies
  FOR SELECT USING (is_private = false AND is_duplicate = false);

CREATE POLICY "Users can insert own strategies" ON strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies" ON strategies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies" ON strategies
  FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public journal entries" ON journal_entries
  FOR SELECT USING (is_private = false);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trades" ON trades
  FOR SELECT USING (is_private = false);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs" ON activity_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs" ON activity_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 7: CREATE STORAGE BUCKETS
-- ============================================================================

-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create the trade-screenshots bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create the strategy-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'strategy-images',
  'strategy-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create the journal-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journal-images',
  'journal-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 8: ADD HELPFUL COMMENTS
-- ============================================================================

-- Add comments to document important columns
COMMENT ON COLUMN trades.is_demo IS 'Indicates whether this trade is a demo trade (true) or real trade (false)';
COMMENT ON COLUMN strategies.is_private IS 'Indicates whether this strategy is private (true) or public (false)';
COMMENT ON COLUMN journal_entries.is_private IS 'Indicates whether this journal entry is private (true) or public (false)';
COMMENT ON COLUMN trades.is_private IS 'Indicates whether this trade is private (true) or public (false)';
COMMENT ON COLUMN strategies.is_duplicate IS 'Indicates whether this strategy is a duplicate of another strategy (true) or an original (false)';
COMMENT ON COLUMN strategies.original_strategy_id IS 'References the original strategy if this is a duplicate, NULL for original strategies';
COMMENT ON COLUMN strategies.duplicate_count IS 'Number of times this strategy has been duplicated by other users';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables exist
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'strategies', 'journal_entries', 'trades', 'activity_logs');

-- Verify columns exist
SELECT 'Required columns verified' as status;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('trades', 'strategies')
AND column_name IN ('is_demo', 'is_private');

-- Verify storage buckets
SELECT 'Storage buckets verified' as status;
SELECT id, name, public FROM storage.buckets
WHERE id IN ('avatars', 'trade-screenshots', 'strategy-images', 'journal-images');

-- Success message
SELECT '✅ Database migration completed successfully!' as final_status;
