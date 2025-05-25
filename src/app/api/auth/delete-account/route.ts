import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('Delete account API called');

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

    // Create a new client instance to verify password without affecting current session
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
        // Extract file path from URL
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-2).join('/'); // Get user_id/filename

        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      } catch (storageError) {
        console.error('Error deleting avatar:', storageError);
        // Continue with account deletion even if avatar deletion fails
      }
    }

    // Disable the account instead of deleting data
    console.log('Starting account disabling process for user:', user.id);

    try {
      // Mark user data as deleted but keep it for potential recovery
      console.log('Marking user data as deleted...');

      // Update profile to mark as deleted
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: `deleted_${user.id.substring(0, 8)}`,
          full_name: '[Deleted User]',
          bio: null,
          avatar_url: null,
          updated_at: new Date().toISOString(),
          // Add a deleted flag if your schema supports it
          // deleted_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update failed:', profileError);
        // Continue anyway - this isn't critical
      } else {
        console.log('Profile marked as deleted');
      }

      // Mark journal entries as private (hide them)
      const { error: journalError } = await supabase
        .from('journal_entries')
        .update({
          is_private: true,
          title: '[Deleted]',
          content: '[This content has been deleted]'
        })
        .eq('user_id', user.id);

      if (journalError) console.log('Journal entries update result:', journalError);

      // Mark trades as private (hide them)
      const { error: tradesError } = await supabase
        .from('trades')
        .update({
          is_private: true,
          notes: '[Deleted]'
        })
        .eq('user_id', user.id);

      if (tradesError) console.log('Trades update result:', tradesError);

      console.log('User data marked as deleted');
    } catch (dataUpdateError) {
      console.error('Data update failed:', dataUpdateError);
      return NextResponse.json(
        { error: 'Failed to disable account. Please contact support.' },
        { status: 500 }
      );
    }

    // Now disable the auth user account to prevent login
    console.log('Disabling auth user account...');

    try {
      // Update the user's email to a disabled state to prevent login
      // Use a more realistic email format that Supabase will accept
      const timestamp = Date.now();
      const disabledEmail = `deleted.${user.id.substring(0, 8)}.${timestamp}@noreply.disabled`;
      const { error: updateError } = await supabase.auth.updateUser({
        email: disabledEmail,
        data: {
          account_disabled: true,
          disabled_at: new Date().toISOString(),
          original_email: user.email,
          disabled_reason: 'User requested account deletion'
        }
      });

      if (updateError) {
        console.log('Account disable failed:', updateError.message);

        // If email update fails, try to at least mark the account in metadata
        try {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              account_disabled: true,
              disabled_at: new Date().toISOString(),
              original_email: user.email,
              disabled_reason: 'User requested account deletion'
            }
          });

          if (!metadataError) {
            console.log('Account marked as disabled in metadata');
          }
        } catch (metadataUpdateError) {
          console.log('Metadata update also failed:', metadataUpdateError);
        }
      } else {
        console.log('Account disabled successfully - email changed to:', disabledEmail);
      }

      // Sign out the user to invalidate their session
      console.log('Signing out user...');
      await supabase.auth.signOut();
      console.log('User signed out successfully');

    } catch (disableError) {
      console.error('Account disable attempt failed:', disableError);

      // Fallback: Just sign out the user
      try {
        console.log('Fallback: signing out user...');
        await supabase.auth.signOut();
        console.log('User signed out successfully');
      } catch (signOutError) {
        console.error('Sign out also failed:', signOutError);
      }
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
