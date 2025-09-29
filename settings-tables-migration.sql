-- Migration to add user settings tables
-- This script creates tables for privacy settings, trading preferences, and security settings

-- Create user privacy settings table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public',
  show_trading_stats BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  allow_direct_messages BOOLEAN DEFAULT true,
  data_collection BOOLEAN DEFAULT true,
  analytics_tracking BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user trading preferences table
CREATE TABLE IF NOT EXISTS user_trading_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  default_risk_percentage DECIMAL(5,2) DEFAULT 2.00,
  default_leverage INTEGER DEFAULT 1,
  preferred_timeframe TEXT DEFAULT '1h',
  auto_calculate_position_size BOOLEAN DEFAULT true,
  show_pnl_in_percentage BOOLEAN DEFAULT false,
  default_currency TEXT DEFAULT 'USD',
  risk_management_alerts BOOLEAN DEFAULT true,
  max_daily_loss DECIMAL(5,2) DEFAULT 5.00,
  max_positions_open INTEGER DEFAULT 5,
  trading_hours_only BOOLEAN DEFAULT false,
  confirm_before_closing BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user security settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  backup_codes TEXT[],
  last_password_change TIMESTAMP WITH TIME ZONE,
  session_timeout INTEGER DEFAULT 30,
  login_notifications BOOLEAN DEFAULT true,
  suspicious_activity_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trading_preferences_user_id ON user_trading_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);

-- Add RLS policies
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trading_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Privacy settings policies
CREATE POLICY "Users can view own privacy settings" ON user_privacy_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own privacy settings" ON user_privacy_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own privacy settings" ON user_privacy_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Trading preferences policies
CREATE POLICY "Users can view own trading preferences" ON user_trading_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trading preferences" ON user_trading_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trading preferences" ON user_trading_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Security settings policies
CREATE POLICY "Users can view own security settings" ON user_security_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own security settings" ON user_security_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Create function to automatically create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default privacy settings
  INSERT INTO user_privacy_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default trading preferences
  INSERT INTO user_trading_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default security settings
  INSERT INTO user_security_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create settings for new profiles
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- Create default settings for existing users
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_trading_preferences (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_security_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT '✅ User settings tables created successfully!' as status;
