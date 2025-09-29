import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return default trading preferences
    // In a real implementation, these would be stored in the database
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

    return NextResponse.json(defaultPreferences);
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

    // In a real implementation, you would store these preferences in the database
    console.log('Trading preferences updated for user:', session.user.id, preferences);

    return NextResponse.json({ message: 'Trading preferences updated successfully' });
  } catch (error: any) {
    console.error('Error updating trading preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
