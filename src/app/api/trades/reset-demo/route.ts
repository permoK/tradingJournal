import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
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

    // Delete all demo trades for the user
    const { error: deleteError } = await supabase
      .from('trades')
      .delete()
      .eq('user_id', user.id)
      .eq('is_demo', true);

    if (deleteError) {
      console.error('Error deleting demo trades:', deleteError);
      return NextResponse.json(
        { error: 'Failed to reset demo trades' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Demo trades reset successfully' 
    });
  } catch (error) {
    console.error('Error in demo trades reset API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
