import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { trades } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all demo trades for the user
    const db = getServerDB();
    const deletedTrades = await db
      .delete(trades)
      .where(
        and(
          eq(trades.userId, session.user.id),
          eq(trades.isDemo, true)
        )
      )
      .returning();

    return NextResponse.json({
      message: 'Demo trades reset successfully',
      deletedCount: deletedTrades.length
    });
  } catch (error) {
    console.error('Error in demo trades reset API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
