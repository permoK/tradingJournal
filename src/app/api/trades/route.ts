import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { trades } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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
    let query = db
      .select()
      .from(trades)
      .where(eq(trades.userId, session.user.id))
      .orderBy(desc(trades.tradeDate));

    // Filter by demo mode if specified
    if (isDemoMode !== null) {
      query = query.where(eq(trades.isDemo, isDemoMode === 'true'));
    }

    const tradesData = await query;

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

    const [newTrade] = await db
      .insert(trades)
      .values({
        ...tradeData,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({ data: newTrade });
  } catch (error: any) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
