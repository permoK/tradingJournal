import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { newsPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    // Get user's notification preferences
    const [preferences] = await db
      .select()
      .from(newsPreferences)
      .where(eq(newsPreferences.userId, session.user.id))
      .limit(1);

    // Return default preferences if none exist
    const defaultPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      tradingAlerts: true,
      newsAlerts: true,
      marketUpdates: false,
      weeklyReports: true,
      securityAlerts: true,
    };

    if (!preferences) {
      return NextResponse.json(defaultPreferences);
    }

    // Map database fields to frontend format
    const mappedPreferences = {
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      tradingAlerts: preferences.notificationsEnabled,
      newsAlerts: preferences.notificationsEnabled,
      marketUpdates: false, // This would be a separate field in a real implementation
      weeklyReports: true, // This would be a separate field in a real implementation
      securityAlerts: true, // Security alerts should always be enabled
    };

    return NextResponse.json(mappedPreferences);
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
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

    const preferences = await request.json();
    const db = getServerDB();

    // Check if preferences already exist
    const [existingPreferences] = await db
      .select()
      .from(newsPreferences)
      .where(eq(newsPreferences.userId, session.user.id))
      .limit(1);

    const updateData = {
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      notificationsEnabled: preferences.tradingAlerts,
      updatedAt: new Date(),
    };

    if (existingPreferences) {
      // Update existing preferences
      await db
        .update(newsPreferences)
        .set(updateData)
        .where(eq(newsPreferences.userId, session.user.id));
    } else {
      // Create new preferences
      await db
        .insert(newsPreferences)
        .values({
          userId: session.user.id,
          ...updateData,
        });
    }

    return NextResponse.json({ message: 'Notification preferences updated successfully' });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
