import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getServerDB } from './db/server';
import { users, accounts, sessions, verificationTokens, profiles } from './db/schema';

export const authOptions: NextAuthOptions = {
  // Temporarily disable adapter to use JWT sessions
  // adapter: DrizzleAdapter(getServerDB(), {
  //   usersTable: users,
  //   accountsTable: accounts,
  //   sessionsTable: sessions,
  //   verificationTokensTable: verificationTokens,
  // }),
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
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile, credentials }) {
      try {
        const db = getServerDB();

        // For Google OAuth, create user and profile if they don't exist
        if (account?.provider === 'google' && user.email) {
          // Check if user exists
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          let userId = existingUser?.id;

          if (!existingUser) {
            // Create new user
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              })
              .returning();
            userId = newUser.id;
            user.id = userId;
          } else {
            user.id = userId;
          }

          // Check if profile exists
          const [existingProfile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, userId!))
            .limit(1);

          if (!existingProfile) {
            // Create new profile
            await db.insert(profiles).values({
              id: userId!,
              fullName: user.name,
              avatarUrl: user.image,
            });
          }
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Don't block sign in
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
