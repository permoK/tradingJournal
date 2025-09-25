import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, fetch the original strategy to duplicate
    const { data: originalStrategy, error: fetchError } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .eq('is_private', false) // Only allow duplicating public strategies
      .single();

    if (fetchError || !originalStrategy) {
      return NextResponse.json(
        { error: 'Strategy not found or is not public' },
        { status: 404 }
      );
    }

    // Check if user is trying to duplicate their own strategy
    if (originalStrategy.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot duplicate your own strategy' },
        { status: 400 }
      );
    }

    // Check if user has already duplicated this strategy
    const { data: existingDuplicate, error: duplicateCheckError } = await supabase
      .from('strategies')
      .select('id')
      .eq('user_id', user.id)
      .eq('original_strategy_id', id)
      .single();

    if (existingDuplicate) {
      return NextResponse.json(
        { error: 'You have already duplicated this strategy' },
        { status: 400 }
      );
    }

    // Create the duplicate strategy
    const { data: duplicatedStrategy, error: createError } = await supabase
      .from('strategies')
      .insert({
        name: originalStrategy.name,
        description: originalStrategy.description,
        details: originalStrategy.details,
        image_url: originalStrategy.image_url,
        category: originalStrategy.category,
        user_id: user.id,
        is_private: true, // Duplicated strategies start as private
        is_duplicate: true,
        original_strategy_id: id,
        is_active: true,
        success_rate: 0, // Reset performance metrics for the new user
        total_trades: 0,
        profitable_trades: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating duplicate strategy:', createError);
      return NextResponse.json(
        { error: 'Failed to duplicate strategy' },
        { status: 500 }
      );
    }

    // Increment the duplicate count on the original strategy
    const { error: updateError } = await supabase
      .from('strategies')
      .update({
        duplicate_count: (originalStrategy.duplicate_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating duplicate count:', updateError);
      // Don't fail the request if this fails, just log it
    }

    return NextResponse.json({
      message: 'Strategy duplicated successfully',
      strategy: duplicatedStrategy
    });

  } catch (error) {
    console.error('Error duplicating strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
