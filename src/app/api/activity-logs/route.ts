import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { activityLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();
    const data = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, session.user.id))
      .orderBy(desc(activityLogs.activityDate));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
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

    const [newActivity] = await db
      .insert(activityLogs)
      .values({
        ...body,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({ data: newActivity });
  } catch (error: any) {
    console.error('Error creating activity log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
