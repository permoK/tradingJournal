import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { newsService } from '@/lib/newsService';
import { getServerDB } from '@/lib/db/server';
import { newsPreferences, newsAlerts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'news';
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const importance = searchParams.get('importance');

    if (type === 'calendar') {
      const events = await newsService.fetchEconomicCalendar();
      return NextResponse.json({ events });
    }

    // Fetch news articles
    let articles = await newsService.fetchForexNews(limit);

    // Apply filters
    if (category && category !== 'all') {
      articles = articles.filter(article => article.category === category);
    }

    if (importance && importance !== 'all') {
      articles = articles.filter(article => article.importance === importance);
    }

    return NextResponse.json({ articles });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, articleId, preferences } = body;

    if (action === 'mark-read') {
      // Mark article as read (you can store this in a user_news_interactions table)
      // For now, just return success
      return NextResponse.json({ success: true });
    }

    if (action === 'save-preferences') {
      // Save user news preferences
      const db = getServerDB();

      try {
        const [result] = await db
          .insert(newsPreferences)
          .values({
            userId: session.user.id,
            categories: preferences.categories || ['forex', 'economic', 'central-bank', 'market'],
            importanceLevels: preferences.importanceLevels || ['high', 'medium'],
            notificationsEnabled: preferences.notificationsEnabled || false,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: newsPreferences.userId,
            set: {
              categories: preferences.categories || ['forex', 'economic', 'central-bank', 'market'],
              importanceLevels: preferences.importanceLevels || ['high', 'medium'],
              notificationsEnabled: preferences.notificationsEnabled || false,
              updatedAt: new Date(),
            }
          })
          .returning();

        return NextResponse.json({ success: true, data: result });
      } catch (error) {
        console.error('Error saving news preferences:', error);
        return NextResponse.json(
          { error: 'Failed to save preferences' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing news request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
