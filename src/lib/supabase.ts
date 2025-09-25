// Temporary stub file for compatibility during migration
// These functions will be replaced with NextAuth.js and API routes

export const createClient = () => {
  throw new Error('Supabase client is no longer available. Please use NextAuth.js and API routes.');
};

export const supabase = {
  from: () => {
    throw new Error('Supabase client is no longer available. Please use NextAuth.js and API routes.');
  }
};
