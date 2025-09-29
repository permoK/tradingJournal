import { NextRequest, NextResponse } from 'next/server';
import { downloadFileByName } from '@/lib/backblaze';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const fileName = path.join('/');

    if (!fileName) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Download the file from Backblaze B2
    const downloadResponse = await downloadFileByName(fileName, 'avatars');

    // Determine content type based on file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default

    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }

    // Return the image with appropriate headers
    return new NextResponse(downloadResponse.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': downloadResponse.data.length.toString(),
      },
    });

  } catch (error) {
    console.error('Avatar proxy error:', error);

    // Return a 404 for file not found, 500 for other errors
    if (error instanceof Error && error.message.includes('not_found')) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get avatar' },
      { status: 500 }
    );
  }
}
