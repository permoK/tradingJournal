import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    // For now, we'll just return success
    // In a real implementation, you would:
    // 1. Generate a QR code for the user to scan with their authenticator app
    // 2. Store the secret in the database
    // 3. Verify the initial code from the user
    // 4. Enable/disable 2FA in the user's profile

    return NextResponse.json({ 
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled 
    });
  } catch (error: any) {
    console.error('Error updating two-factor authentication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
