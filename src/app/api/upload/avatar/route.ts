import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { processUserAvatar, validateAvatarFile } from '@/lib/avatar-utils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate the avatar file
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Process and upload the avatar
    const avatarUrl = await processUserAvatar(file, session.user.id);

    // Update the user's profile with the new avatar URL
    const db = getServerDB();
    const [updatedProfile] = await db
      .update(profiles)
      .set({ 
        avatarUrl: avatarUrl,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      url: avatarUrl,
      profile: updatedProfile,
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Avatar upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove avatar from user's profile
    const db = getServerDB();
    const [updatedProfile] = await db
      .update(profiles)
      .set({ 
        avatarUrl: null,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Avatar deletion failed' },
      { status: 500 }
    );
  }
}
