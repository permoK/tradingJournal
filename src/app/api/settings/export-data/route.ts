import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { profiles, strategies, trades, journalEntries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    // Fetch user's data
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1);

    const userStrategies = await db
      .select()
      .from(strategies)
      .where(eq(strategies.userId, session.user.id));

    const userTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, session.user.id));

    const userJournalEntries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, session.user.id));

    // Compile data export
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      profile: profile || null,
      strategies: userStrategies,
      trades: userTrades,
      journalEntries: userJournalEntries,
      metadata: {
        totalStrategies: userStrategies.length,
        totalTrades: userTrades.length,
        totalJournalEntries: userJournalEntries.length,
        exportVersion: '1.0',
      },
    };

    // Create JSON response
    const jsonData = JSON.stringify(exportData, null, 2);
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tradeflow-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
