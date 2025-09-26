import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { strategies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
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

    const db = getServerDB();
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id))
      .limit(1);

    if (!strategy || strategy.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Error in strategy API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getServerDB();

    // First check if the strategy exists and belongs to the user
    const [existingStrategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id))
      .limit(1);

    if (!existingStrategy || existingStrategy.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Update the strategy
    const [updatedStrategy] = await db
      .update(strategies)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(eq(strategies.id, id))
      .returning();

    return NextResponse.json(updatedStrategy);
  } catch (error) {
    console.error('Error in strategy update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const db = getServerDB();

    // First, check if this strategy has duplicates
    const duplicates = await db
      .select({
        id: strategies.id,
        userId: strategies.userId,
        isPrivate: strategies.isPrivate
      })
      .from(strategies)
      .where(eq(strategies.originalStrategyId, id));

    // Delete the original strategy
    const deletedStrategy = await db
      .delete(strategies)
      .where(eq(strategies.id, id))
      .returning();

    if (deletedStrategy.length === 0) {
      return NextResponse.json(
        { error: 'Strategy not found or not authorized to delete' },
        { status: 404 }
      );
    }

    // If there are duplicates, promote one public duplicate to be the new "original"
    if (duplicates && duplicates.length > 0) {
      // Find a public duplicate to promote
      const publicDuplicate = duplicates.find(dup => !dup.isPrivate);

      if (publicDuplicate) {
        // Promote this duplicate to be the new original
        await db
          .update(strategies)
          .set({
            isDuplicate: false,
            originalStrategyId: null,
            duplicateCount: duplicates.length - 1, // Count remaining duplicates
            updatedAt: new Date()
          })
          .where(eq(strategies.id, publicDuplicate.id));

        // Update remaining duplicates to point to the new original
        const remainingDuplicates = duplicates.filter(dup => dup.id !== publicDuplicate.id);
        if (remainingDuplicates.length > 0) {
          const remainingIds = remainingDuplicates.map(dup => dup.id);
          for (const duplicateId of remainingIds) {
            await db
              .update(strategies)
              .set({
                originalStrategyId: publicDuplicate.id,
                updatedAt: new Date()
              })
              .where(eq(strategies.id, duplicateId));
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in strategy delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
