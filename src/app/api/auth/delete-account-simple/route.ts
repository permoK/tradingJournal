import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('Simple delete account API called');
  
  try {
    const { password } = await request.json();
    console.log('Password received:', !!password);
    
    if (!password) {
      console.log('No password provided');
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User authentication check:', { hasUser: !!user, userError: !!userError });

    if (userError || !user) {
      console.log('User not authenticated:', userError);
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Create a new client instance to verify password
    const tempClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify password before deletion
    console.log('Verifying password for user:', user.email);
    const { error: verifyError } = await tempClient.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (verifyError) {
      console.error('Password verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }
    
    console.log('Password verification successful');

    // Get user profile to check for avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    // Delete avatar from storage if it exists
    if (profile?.avatar_url) {
      try {
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-2).join('/');
        
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      } catch (storageError) {
        console.error('Error deleting avatar:', storageError);
      }
    }

    console.log('Starting data deletion for user:', user.id);
    
    // Delete user data manually
    try {
      await Promise.all([
        supabase.from('activity_logs').delete().eq('user_id', user.id),
        supabase.from('trades').delete().eq('user_id', user.id),
        supabase.from('journal_entries').delete().eq('user_id', user.id),
        supabase.from('user_progress').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id)
      ]);
      console.log('User data deleted successfully');
    } catch (dataError) {
      console.error('Data deletion failed:', dataError);
      return NextResponse.json(
        { error: 'Failed to delete account data' },
        { status: 500 }
      );
    }

    // Use the authenticated client to delete the user account
    console.log('Attempting to delete user account...');
    try {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteUserError) {
        console.error('User deletion failed:', deleteUserError);
        // Sign out anyway since data is deleted
        await supabase.auth.signOut();
        return NextResponse.json(
          { 
            error: 'Account data deleted but failed to delete user account. You have been signed out.',
            partialSuccess: true
          },
          { status: 500 }
        );
      }
      
      console.log('User account deleted successfully');
    } catch (deleteError) {
      console.error('Delete user error:', deleteError);
      // Sign out anyway since data is deleted
      await supabase.auth.signOut();
      return NextResponse.json(
        { 
          error: 'Account data deleted but failed to delete user account. You have been signed out.',
          partialSuccess: true
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
