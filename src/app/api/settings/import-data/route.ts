import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerDB } from '@/lib/db/server';
import { strategies, trades, journalEntries } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/json') {
      return NextResponse.json(
        { error: 'Invalid file type. Only JSON files are supported.' },
        { status: 400 }
      );
    }

    // Read and parse the file
    const fileContent = await file.text();
    let importData;

    try {
      importData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON file format' },
        { status: 400 }
      );
    }

    // Validate the import data structure
    if (!importData || typeof importData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const db = getServerDB();
    let importedCount = 0;

    // Import strategies
    if (importData.strategies && Array.isArray(importData.strategies)) {
      for (const strategy of importData.strategies) {
        try {
          await db.insert(strategies).values({
            userId: session.user.id,
            name: strategy.name || 'Imported Strategy',
            description: strategy.description || '',
            details: strategy.details || '',
            category: strategy.category || 'imported',
            isPrivate: true, // Import as private by default
          });
          importedCount++;
        } catch (error) {
          console.error('Error importing strategy:', error);
        }
      }
    }

    // Import trades
    if (importData.trades && Array.isArray(importData.trades)) {
      for (const trade of importData.trades) {
        try {
          await db.insert(trades).values({
            userId: session.user.id,
            tradeDate: trade.tradeDate ? new Date(trade.tradeDate) : new Date(),
            market: trade.symbol || trade.market || 'UNKNOWN',
            tradeType: trade.type || trade.tradeType || 'buy',
            entryPrice: trade.entryPrice?.toString() || '0',
            exitPrice: trade.exitPrice?.toString() || null,
            quantity: trade.quantity?.toString() || '1',
            profitLoss: trade.profitLoss?.toString() || null,
            status: trade.status || 'closed',
            notes: trade.notes || '',
            isDemo: trade.isDemo || false,
          });
          importedCount++;
        } catch (error) {
          console.error('Error importing trade:', error);
        }
      }
    }

    // Import journal entries
    if (importData.journalEntries && Array.isArray(importData.journalEntries)) {
      for (const entry of importData.journalEntries) {
        try {
          await db.insert(journalEntries).values({
            userId: session.user.id,
            title: entry.title || 'Imported Entry',
            content: entry.content || '',
            tags: entry.tags || [],
          });
          importedCount++;
        } catch (error) {
          console.error('Error importing journal entry:', error);
        }
      }
    }

    return NextResponse.json({
      message: 'Data imported successfully',
      imported: importedCount,
    });
  } catch (error: any) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
