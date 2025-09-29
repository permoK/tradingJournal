import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify Backblaze B2 credentials using direct HTTP
export async function GET(request: NextRequest) {
  try {
    const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;

    if (!applicationKeyId || !applicationKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials'
      }, { status: 400 });
    }

    // Create basic auth header
    const credentials = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64');
    
    console.log('Testing direct B2 authorization...');
    console.log('Key ID:', applicationKeyId);
    console.log('Key length:', applicationKey.length);
    console.log('Credentials (base64):', credentials);

    // Try to authorize with B2 API directly
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Authorization failed',
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        troubleshooting: [
          'Check that your application key ID is correct',
          'Verify that your application key is complete and correct',
          'Make sure the key has the right permissions',
          'Try creating a new application key'
        ]
      }, { status: 500 });
    }

    const authData = await response.json();
    console.log('Authorization successful:', authData);

    return NextResponse.json({
      success: true,
      message: 'Backblaze B2 authorization successful!',
      authData: {
        accountId: authData.accountId,
        apiUrl: authData.apiUrl,
        downloadUrl: authData.downloadUrl,
        // Don't expose the auth token for security
      }
    });

  } catch (error) {
    console.error('Direct B2 test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
