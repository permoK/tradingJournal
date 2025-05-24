-- Enable Row Level Security
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
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_topics table
CREATE TABLE IF NOT EXISTS learning_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  order_index INTEGER DEFAULT 0
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES learning_topics(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, topic_id)
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
  tags TEXT[] DEFAULT '{}'
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  is_private BOOLEAN DEFAULT true
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

-- Set up Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_progress
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

-- Learning topics policies (public read, admin write)
CREATE POLICY "Anyone can view learning topics" ON learning_topics
  FOR SELECT USING (true);

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default learning topics
INSERT INTO learning_topics (title, description, category, difficulty, order_index) VALUES
  ('Introduction to Deriv', 'Learn the basics of Deriv trading platform', 'Basics', 'Beginner', 1),
  ('Understanding Market Types', 'Explore different markets available on Deriv', 'Markets', 'Beginner', 2),
  ('Technical Analysis Basics', 'Learn how to analyze price charts', 'Analysis', 'Intermediate', 3),
  ('Risk Management Strategies', 'Understand how to manage risk in trading', 'Strategy', 'Intermediate', 4),
  ('Advanced Trading Patterns', 'Master complex trading patterns', 'Analysis', 'Advanced', 5),
  ('Trading Psychology', 'Develop the right mindset for trading', 'Psychology', 'Intermediate', 6),
  ('Money Management', 'Learn effective capital allocation', 'Strategy', 'Advanced', 7),
  ('Market Analysis Tools', 'Master various analysis tools and indicators', 'Analysis', 'Advanced', 8)
ON CONFLICT (id) DO NOTHING;
