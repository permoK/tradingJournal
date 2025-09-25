import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getServerDB } from './db/server';
import { users, accounts, sessions, verificationTokens, profiles } from './db/schema';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(getServerDB(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = getServerDB();

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Create a profile entry when user signs in for the first time
      if (user.id) {
        try {
          const db = getServerDB();

          // Check if profile already exists
          const existingProfile = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

          if (existingProfile.length === 0) {
            // Create new profile for both Google and credentials users
            await db.insert(profiles).values({
              id: user.id,
              fullName: user.name,
              avatarUrl: user.image,
            });
          }
        } catch (error) {
          console.error('Error creating profile:', error);
          // Don't block sign in if profile creation fails
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
