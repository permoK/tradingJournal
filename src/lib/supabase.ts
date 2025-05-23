// This is a mock implementation of the Supabase client for demonstration purposes
// In a real application, you would use the actual Supabase client

export const supabase = {
  auth: {
    signUp: async () => ({ data: { user: { id: '1' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: '1' } }, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: { user: { id: '1', email: 'demo@example.com' } } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    exchangeCodeForSession: async () => ({}),
    updateUser: async () => ({ data: { user: { id: '1' } }, error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null })
      }),
      order: () => ({ data: [], error: null })
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null })
  })
};
