import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToB2, generateUniqueFileName } from '@/lib/backblaze';

// Test endpoint to verify actual file upload works
export async function POST(request: NextRequest) {
  try {
    // Check authentication (for testing, we'll skip this)
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Create a test image file (1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x21, 0x18, 0xE6, 0x27, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName('test-image.png', 'test-user');

    // Upload to Backblaze B2
    const fileUrl = await uploadToB2(
      testImageData,
      uniqueFileName,
      'image/png',
      'test-uploads'
    );

    return NextResponse.json({
      success: true,
      message: 'Test image upload successful!',
      testFile: {
        fileName: uniqueFileName,
        url: fileUrl,
        size: testImageData.length,
        type: 'image/png'
      },
      note: 'Test image uploaded successfully. You can delete it from your B2 bucket if desired.'
    });

  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
