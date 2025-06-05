-- News System Database Setup
-- This creates the necessary tables for the news system

-- Create news_preferences table for user notification settings
CREATE TABLE IF NOT EXISTS news_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT ARRAY['forex', 'economic', 'central-bank', 'market'],
  importance_levels TEXT[] DEFAULT ARRAY['high', 'medium'],
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create news_alerts table to track shown alerts (prevent duplicate notifications)
CREATE TABLE IF NOT EXISTS news_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_url TEXT,
  importance TEXT CHECK (importance IN ('low', 'medium', 'high')),
  category TEXT CHECK (category IN ('forex', 'economic', 'central-bank', 'market', 'general')),
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_preferences_user_id ON news_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_news_alerts_user_id ON news_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_news_alerts_article_id ON news_alerts(article_id);
CREATE INDEX IF NOT EXISTS idx_news_alerts_shown_at ON news_alerts(shown_at);

-- Enable Row Level Security (RLS)
ALTER TABLE news_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for news_preferences
CREATE POLICY "Users can view their own news preferences" ON news_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news preferences" ON news_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news preferences" ON news_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news preferences" ON news_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for news_alerts
CREATE POLICY "Users can view their own news alerts" ON news_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news alerts" ON news_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news alerts" ON news_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news alerts" ON news_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for news_preferences
CREATE TRIGGER update_news_preferences_updated_at
  BEFORE UPDATE ON news_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default preferences for existing users (optional)
-- This will create default news preferences for users who don't have them yet
INSERT INTO news_preferences (user_id, categories, importance_levels, notifications_enabled)
SELECT 
  id,
  ARRAY['forex', 'economic', 'central-bank', 'market'],
  ARRAY['high', 'medium'],
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM news_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
