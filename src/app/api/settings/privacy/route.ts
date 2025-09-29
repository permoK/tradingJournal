import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { userPrivacySettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    // Get user's privacy settings
    const [settings] = await db
      .select()
      .from(userPrivacySettings)
      .where(eq(userPrivacySettings.userId, session.user.id))
      .limit(1);

    // Return default settings if none exist
    const defaultSettings = {
      profileVisibility: 'public',
      showTradingStats: true,
      showOnlineStatus: true,
      allowDirectMessages: true,
      dataCollection: true,
      analyticsTracking: false,
      marketingEmails: false,
    };

    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    // Map database fields to frontend format
    const mappedSettings = {
      profileVisibility: settings.profileVisibility || 'public',
      showTradingStats: settings.showTradingStats,
      showOnlineStatus: settings.showOnlineStatus,
      allowDirectMessages: settings.allowDirectMessages,
      dataCollection: settings.dataCollection,
      analyticsTracking: settings.analyticsTracking,
      marketingEmails: settings.marketingEmails,
    };

    return NextResponse.json(mappedSettings);
  } catch (error: any) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();
    const db = getServerDB();

    // Check if settings already exist
    const [existingSettings] = await db
      .select()
      .from(userPrivacySettings)
      .where(eq(userPrivacySettings.userId, session.user.id))
      .limit(1);

    const updateData = {
      profileVisibility: settings.profileVisibility,
      showTradingStats: settings.showTradingStats,
      showOnlineStatus: settings.showOnlineStatus,
      allowDirectMessages: settings.allowDirectMessages,
      dataCollection: settings.dataCollection,
      analyticsTracking: settings.analyticsTracking,
      marketingEmails: settings.marketingEmails,
      updatedAt: new Date(),
    };

    if (existingSettings) {
      // Update existing settings
      await db
        .update(userPrivacySettings)
        .set(updateData)
        .where(eq(userPrivacySettings.userId, session.user.id));
    } else {
      // Create new settings
      await db
        .insert(userPrivacySettings)
        .values({
          userId: session.user.id,
          ...updateData,
        });
    }

    return NextResponse.json({ message: 'Privacy settings updated successfully' });
  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
