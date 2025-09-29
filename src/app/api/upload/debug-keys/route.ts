import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check key formats
export async function GET(request: NextRequest) {
  try {
    const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;

    return NextResponse.json({
      keyId: {
        value: applicationKeyId,
        length: applicationKeyId?.length,
        format: applicationKeyId?.match(/^[0-9a-f]{24}$/) ? 'Valid B2 Key ID format' : 'Invalid format - should be 24 hex characters'
      },
      applicationKey: {
        length: applicationKey?.length,
        startsWithK: applicationKey?.startsWith('K'),
        format: applicationKey && applicationKey.length >= 40 ? 'Likely valid length' : 'Too short - B2 keys are typically 40+ characters'
      },
      recommendations: [
        'B2 Application Key ID should be 24 hexadecimal characters',
        'B2 Application Key should be 40+ characters and often starts with K',
        'For S3-compatible access, you need S3-compatible application keys',
        'Make sure you copied the FULL application key from Backblaze'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check keys',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
