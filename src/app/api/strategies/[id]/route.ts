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

    const { data: strategy, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching strategy:', error);
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

    const { data: strategy, error } = await supabase
      .from('strategies')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating strategy:', error);
      return NextResponse.json(
        { error: 'Failed to update strategy' },
        { status: 400 }
      );
    }

    return NextResponse.json(strategy);
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

    // First, check if this strategy has duplicates
    const { data: duplicates, error: duplicatesError } = await supabase
      .from('strategies')
      .select('id, user_id, is_private')
      .eq('original_strategy_id', id);

    if (duplicatesError) {
      console.error('Error checking duplicates:', duplicatesError);
    }

    // Delete the original strategy
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting strategy:', error);
      return NextResponse.json(
        { error: 'Failed to delete strategy' },
        { status: 400 }
      );
    }

    // If there are duplicates, promote one public duplicate to be the new "original"
    if (duplicates && duplicates.length > 0) {
      // Find a public duplicate to promote
      const publicDuplicate = duplicates.find(dup => !dup.is_private);

      if (publicDuplicate) {
        // Promote this duplicate to be the new original
        const { error: promoteError } = await supabase
          .from('strategies')
          .update({
            is_duplicate: false,
            original_strategy_id: null,
            duplicate_count: duplicates.length - 1, // Count remaining duplicates
            updated_at: new Date().toISOString()
          })
          .eq('id', publicDuplicate.id);

        if (promoteError) {
          console.error('Error promoting duplicate to original:', promoteError);
        } else {
          // Update remaining duplicates to point to the new original
          const remainingDuplicates = duplicates.filter(dup => dup.id !== publicDuplicate.id);
          if (remainingDuplicates.length > 0) {
            const { error: updateDuplicatesError } = await supabase
              .from('strategies')
              .update({
                original_strategy_id: publicDuplicate.id,
                updated_at: new Date().toISOString()
              })
              .in('id', remainingDuplicates.map(dup => dup.id));

            if (updateDuplicatesError) {
              console.error('Error updating duplicate references:', updateDuplicatesError);
            }
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
