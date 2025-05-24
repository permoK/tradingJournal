import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Client-side Supabase client
export const createClient = () => createClientComponentClient();

// Default client for backwards compatibility
export const supabase = createClient();
