-- Migration to add is_demo column to trades table
-- Run this in your Supabase SQL editor

-- Add the is_demo column to the trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Update existing trades to be real trades (not demo)
UPDATE trades SET is_demo = false WHERE is_demo IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN trades.is_demo IS 'Indicates whether this trade is a demo trade (true) or real trade (false)';
