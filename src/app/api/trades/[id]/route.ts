import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: trade, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trade:', error);
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trade);
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
    const { id } = await params;
    const body = await request.json();

    const { data: trade, error } = await supabase
      .from('trades')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trade:', error);
      return NextResponse.json(
        { error: 'Failed to update trade' },
        { status: 400 }
      );
    }

    return NextResponse.json(trade);
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
    const { id } = await params;
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trade:', error);
      return NextResponse.json(
        { error: 'Failed to delete trade' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in trade delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
