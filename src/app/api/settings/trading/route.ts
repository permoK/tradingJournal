import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { userTradingPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    // Get user's trading preferences
    const [preferences] = await db
      .select()
      .from(userTradingPreferences)
      .where(eq(userTradingPreferences.userId, session.user.id))
      .limit(1);

    // Return default preferences if none exist
    const defaultPreferences = {
      defaultRiskPercentage: 2,
      defaultLeverage: 1,
      preferredTimeframe: '1h',
      autoCalculatePositionSize: true,
      showPnLInPercentage: false,
      defaultCurrency: 'USD',
      riskManagementAlerts: true,
      maxDailyLoss: 5,
      maxPositionsOpen: 5,
      tradingHoursOnly: false,
      confirmBeforeClosing: true,
    };

    if (!preferences) {
      return NextResponse.json(defaultPreferences);
    }

    // Map database fields to frontend format
    const mappedPreferences = {
      defaultRiskPercentage: parseFloat(preferences.defaultRiskPercentage || '2'),
      defaultLeverage: preferences.defaultLeverage || 1,
      preferredTimeframe: preferences.preferredTimeframe || '1h',
      autoCalculatePositionSize: preferences.autoCalculatePositionSize,
      showPnLInPercentage: preferences.showPnLInPercentage,
      defaultCurrency: preferences.defaultCurrency || 'USD',
      riskManagementAlerts: preferences.riskManagementAlerts,
      maxDailyLoss: parseFloat(preferences.maxDailyLoss || '5'),
      maxPositionsOpen: preferences.maxPositionsOpen || 5,
      tradingHoursOnly: preferences.tradingHoursOnly,
      confirmBeforeClosing: preferences.confirmBeforeClosing,
    };

    return NextResponse.json(mappedPreferences);
  } catch (error: any) {
    console.error('Error fetching trading preferences:', error);
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

    // Validate preferences
    if (preferences.defaultRiskPercentage < 0.1 || preferences.defaultRiskPercentage > 10) {
      return NextResponse.json(
        { error: 'Risk percentage must be between 0.1% and 10%' },
        { status: 400 }
      );
    }

    if (preferences.maxDailyLoss < 1 || preferences.maxDailyLoss > 20) {
      return NextResponse.json(
        { error: 'Max daily loss must be between 1% and 20%' },
        { status: 400 }
      );
    }

    if (preferences.maxPositionsOpen < 1 || preferences.maxPositionsOpen > 20) {
      return NextResponse.json(
        { error: 'Max open positions must be between 1 and 20' },
        { status: 400 }
      );
    }

    const db = getServerDB();

    // Check if preferences already exist
    const [existingPreferences] = await db
      .select()
      .from(userTradingPreferences)
      .where(eq(userTradingPreferences.userId, session.user.id))
      .limit(1);

    const updateData = {
      defaultRiskPercentage: preferences.defaultRiskPercentage.toString(),
      defaultLeverage: preferences.defaultLeverage,
      preferredTimeframe: preferences.preferredTimeframe,
      autoCalculatePositionSize: preferences.autoCalculatePositionSize,
      showPnLInPercentage: preferences.showPnLInPercentage,
      defaultCurrency: preferences.defaultCurrency,
      riskManagementAlerts: preferences.riskManagementAlerts,
      maxDailyLoss: preferences.maxDailyLoss.toString(),
      maxPositionsOpen: preferences.maxPositionsOpen,
      tradingHoursOnly: preferences.tradingHoursOnly,
      confirmBeforeClosing: preferences.confirmBeforeClosing,
      updatedAt: new Date(),
    };

    if (existingPreferences) {
      // Update existing preferences
      await db
        .update(userTradingPreferences)
        .set(updateData)
        .where(eq(userTradingPreferences.userId, session.user.id));
    } else {
      // Create new preferences
      await db
        .insert(userTradingPreferences)
        .values({
          userId: session.user.id,
          ...updateData,
        });
    }

    return NextResponse.json({ message: 'Trading preferences updated successfully' });
  } catch (error: any) {
    console.error('Error updating trading preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
