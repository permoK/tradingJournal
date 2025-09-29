import { NextRequest, NextResponse } from 'next/server';
import { uploadToB2S3 } from '@/lib/backblaze-s3';

// Test endpoint to verify Backblaze B2 S3-compatible connection
export async function GET(request: NextRequest) {
  try {
    // First, let's debug the environment variables
    console.log('Environment variables check:');
    console.log('B2_APPLICATION_KEY_ID:', process.env.B2_APPLICATION_KEY_ID ? 'Set' : 'Not set');
    console.log('B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? 'Set' : 'Not set');
    console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID);

    // Create a small test file
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testContent, 'utf8');
    const testFileName = `test_${Date.now()}.txt`;

    // Try to upload to B2 using S3-compatible API
    const fileUrl = await uploadToB2S3(
      testBuffer,
      testFileName,
      'text/plain',
      'test-uploads'
    );

    return NextResponse.json({
      success: true,
      message: 'Backblaze B2 S3-compatible connection successful!',
      testFile: {
        fileName: testFileName,
        url: fileUrl,
        size: testBuffer.length
      },
      note: 'Test file uploaded successfully using S3-compatible API. You can delete it from your B2 bucket if desired.'
    });

  } catch (error) {
    console.error('Backblaze S3 connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'S3 connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check that your B2 credentials are correct',
        'Verify your bucket exists and is accessible',
        'Ensure your application key has read/write permissions',
        'Check that your bucket is configured for S3-compatible access',
        'Verify the endpoint URL is correct for your region'
      ]
    }, { status: 500 });
  }
}
