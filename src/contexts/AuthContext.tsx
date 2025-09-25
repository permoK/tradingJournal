'use client';

import { createContext, useContext } from 'react';
import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from 'next-auth/react';
import type { Session } from 'next-auth';

interface AuthContextType {
  user: Session['user'] | null;
  session: Session | null;
  loading: boolean;
  signIn: (provider?: 'google' | 'credentials', credentials?: { email: string; password: string }) => Promise<any>;
  signUp: (userData: { email: string; password: string; fullName: string; username: string }) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = session?.user || null;

  const signIn = async (provider: 'google' | 'credentials' = 'google', credentials?: { email: string; password: string }) => {
    if (provider === 'google') {
      return await nextAuthSignIn('google', { callbackUrl: '/dashboard' });
    } else if (provider === 'credentials' && credentials) {
      return await nextAuthSignIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        callbackUrl: '/dashboard',
      });
    }
  };

  const signUp = async (userData: { email: string; password: string; fullName: string; username: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error };
      }

      // After successful registration, sign in the user
      return await signIn('credentials', {
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
