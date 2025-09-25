import { getServerDB } from './server';
import { profiles } from './schema';
import { eq } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

export interface CreateProfileData {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(userData: CreateProfileData) {
  try {
    const db = getServerDB();
    const [profile] = await db
      .insert(profiles)
      .values({
        id: userData.id,
        username: userData.username || null,
        fullName: userData.fullName || null,
        avatarUrl: userData.avatarUrl || null,
      })
      .returning();

    return { data: profile, error: null };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const db = getServerDB();
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return { data: profile || null, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<CreateProfileData, 'id'>>
) {
  try {
    const db = getServerDB();
    const [profile] = await db
      .update(profiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    return { data: profile, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Handle new user signup - create profile from Supabase user data
 */
export async function handleNewUserSignup(user: User) {
  const userData: CreateProfileData = {
    id: user.id,
    username: user.user_metadata?.username,
    fullName: user.user_metadata?.full_name || user.user_metadata?.name,
    avatarUrl: user.user_metadata?.avatar_url,
  };

  return await createUserProfile(userData);
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string) {
  try {
    const db = getServerDB();
    let query = db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, username));

    if (excludeUserId) {
      // Add condition to exclude current user when updating
      const { ne } = await import('drizzle-orm');
      query = query.where(ne(profiles.id, excludeUserId));
    }

    const [existingProfile] = await query.limit(1);
    return { available: !existingProfile, error: null };
  } catch (error: any) {
    console.error('Error checking username availability:', error);
    return { available: false, error: error.message };
  }
}
