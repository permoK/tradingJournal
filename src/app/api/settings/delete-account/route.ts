import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { 
  users, 
  profiles, 
  strategies, 
  trades, 
  journalEntries, 
  activityLogs,
  newsPreferences,
  newsAlerts 
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getServerDB();

    // Start a transaction to ensure all data is deleted atomically
    await db.transaction(async (tx) => {
      // Delete in order of dependencies (child tables first)
      
      // Delete news alerts
      await tx.delete(newsAlerts).where(eq(newsAlerts.userId, session.user.id));
      
      // Delete news preferences
      await tx.delete(newsPreferences).where(eq(newsPreferences.userId, session.user.id));
      
      // Delete activity logs
      await tx.delete(activityLogs).where(eq(activityLogs.userId, session.user.id));
      
      // Delete journal entries
      await tx.delete(journalEntries).where(eq(journalEntries.userId, session.user.id));
      
      // Delete trades
      await tx.delete(trades).where(eq(trades.userId, session.user.id));
      
      // Delete strategies
      await tx.delete(strategies).where(eq(strategies.userId, session.user.id));
      
      // Delete profile
      await tx.delete(profiles).where(eq(profiles.id, session.user.id));
      
      // Finally, delete the user account
      await tx.delete(users).where(eq(users.id, session.user.id));
    });

    return NextResponse.json({ 
      message: 'Account and all associated data have been permanently deleted' 
    });
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
