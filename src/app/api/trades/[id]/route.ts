import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { trades } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getServerDB();

    const [trade] = await db
      .select()
      .from(trades)
      .where(eq(trades.id, id))
      .limit(1);

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trade });
  } catch (error) {
    console.error('Error in trade API:', error);
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getServerDB();

    const [trade] = await db
      .update(trades)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(eq(trades.id, id))
      .returning();

    if (!trade) {
      return NextResponse.json(
        { error: 'Failed to update trade' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: trade });
  } catch (error) {
    console.error('Error in trade update API:', error);
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getServerDB();

    await db
      .delete(trades)
      .where(eq(trades.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in trade delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
