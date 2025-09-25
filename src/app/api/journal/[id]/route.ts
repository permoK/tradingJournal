import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { journalEntries } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getServerDB();

    const [updatedEntry] = await db
      .update(journalEntries)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedEntry });
  } catch (error: any) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    await db
      .delete(journalEntries)
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
