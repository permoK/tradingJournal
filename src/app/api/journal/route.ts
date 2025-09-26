import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { journalEntries } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') !== 'false';

    const db = getServerDB();

    // Build where conditions
    const whereConditions = [eq(journalEntries.userId, session.user.id)];

    // If not including private, filter them out
    if (!includePrivate) {
      whereConditions.push(eq(journalEntries.isPrivate, false));
    }

    const data = await db
      .select()
      .from(journalEntries)
      .where(and(...whereConditions))
      .orderBy(desc(journalEntries.createdAt));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getServerDB();

    const [newEntry] = await db
      .insert(journalEntries)
      .values({
        ...body,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({ data: newEntry });
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
