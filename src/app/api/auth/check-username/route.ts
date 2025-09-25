import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isUsernameAvailable } from '@/lib/db/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
        },
        { status: 400 }
      );
    }

    // Check if username exists using our database
    const { available, error } = await isUsernameAvailable(username);

    if (error) {
      console.error('Error checking username:', error);
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
