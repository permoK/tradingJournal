import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { strategies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, fetch the original strategy to duplicate
    const db = getServerDB();
    const [originalStrategy] = await db
      .select()
      .from(strategies)
      .where(
        and(
          eq(strategies.id, id),
          eq(strategies.isPrivate, false) // Only allow duplicating public strategies
        )
      )
      .limit(1);

    if (!originalStrategy) {
      return NextResponse.json(
        { error: 'Strategy not found or is not public' },
        { status: 404 }
      );
    }

    // Check if user is trying to duplicate their own strategy
    if (originalStrategy.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot duplicate your own strategy' },
        { status: 400 }
      );
    }

    // Check if user has already duplicated this strategy
    const [existingDuplicate] = await db
      .select()
      .from(strategies)
      .where(
        and(
          eq(strategies.userId, session.user.id),
          eq(strategies.originalStrategyId, id)
        )
      )
      .limit(1);

    if (existingDuplicate) {
      return NextResponse.json(
        { error: 'You have already duplicated this strategy' },
        { status: 400 }
      );
    }

    // Create the duplicate strategy
    try {
      const [duplicatedStrategy] = await db
        .insert(strategies)
        .values({
          name: originalStrategy.name,
          description: originalStrategy.description,
          details: originalStrategy.details,
          imageUrl: originalStrategy.imageUrl,
          category: originalStrategy.category,
          userId: session.user.id,
          isPrivate: true, // Duplicated strategies start as private
          isDuplicate: true,
          originalStrategyId: id,
          isActive: true,
          successRate: '0', // Reset performance metrics for the new user
          totalTrades: 0,
          profitableTrades: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Increment the duplicate count on the original strategy
      await db
        .update(strategies)
        .set({
          duplicateCount: (originalStrategy.duplicateCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(strategies.id, id));

      return NextResponse.json({
        message: 'Strategy duplicated successfully',
        strategy: duplicatedStrategy
      });

    } catch (createError) {
      console.error('Error creating duplicate strategy:', createError);
      return NextResponse.json(
        { error: 'Failed to duplicate strategy' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error duplicating strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
