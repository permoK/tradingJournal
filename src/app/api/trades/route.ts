import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { trades } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') !== 'false';
    const isDemoMode = searchParams.get('isDemoMode');

    const db = getServerDB();

    // Build where conditions
    let whereConditions = [eq(trades.userId, session.user.id)];

    // Filter by demo mode if specified
    if (isDemoMode !== null) {
      whereConditions.push(eq(trades.isDemo, isDemoMode === 'true'));
    }

    const tradesData = await db
      .select()
      .from(trades)
      .where(and(...whereConditions))
      .orderBy(desc(trades.tradeDate));

    return NextResponse.json({ data: tradesData });
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeData = await request.json();
    const db = getServerDB();

    // Process the trade data
    const processedTradeData = {
      ...tradeData,
      userId: session.user.id,
    };

    // Convert tradeDate string back to Date object for Drizzle
    if (processedTradeData.tradeDate && typeof processedTradeData.tradeDate === 'string') {
      processedTradeData.tradeDate = new Date(processedTradeData.tradeDate);
    }

    const [newTrade] = await db
      .insert(trades)
      .values(processedTradeData)
      .returning();

    return NextResponse.json({ data: newTrade });
  } catch (error: any) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
