import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to verify Backblaze configuration
export async function GET(request: NextRequest) {
  try {
    // Check if all required environment variables are set
    const requiredEnvVars = [
      'B2_APPLICATION_KEY_ID',
      'B2_APPLICATION_KEY',
      'B2_BUCKET_NAME',
      'B2_BUCKET_ID',
      'NEXT_PUBLIC_B2_DOWNLOAD_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        missingVars,
        message: 'Please check your .env.local file and ensure all Backblaze B2 variables are set.'
      }, { status: 400 });
    }

    // Try to import and initialize B2 client (without actually connecting)
    try {
      const { getB2Client } = await import('@/lib/backblaze');
      
      return NextResponse.json({
        success: true,
        message: 'Backblaze B2 configuration looks good!',
        config: {
          bucketName: process.env.B2_BUCKET_NAME,
          bucketId: process.env.B2_BUCKET_ID,
          downloadUrl: process.env.NEXT_PUBLIC_B2_DOWNLOAD_URL,
          keyId: process.env.B2_APPLICATION_KEY_ID?.substring(0, 8) + '...' // Show only first 8 chars for security
        }
      });
    } catch (importError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to import Backblaze service',
        message: 'There might be an issue with the Backblaze B2 package installation.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Backblaze test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Configuration test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
