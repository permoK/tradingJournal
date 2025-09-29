import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToB2, deleteFromB2, generateUniqueFileName, validateFile, fileToBuffer } from '@/lib/backblaze';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, 10); // 10MB max
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name, session.user.id);

    // Convert file to buffer
    const fileBuffer = await fileToBuffer(file);

    // Upload to Backblaze B2
    const fileUrl = await uploadToB2(
      fileBuffer,
      uniqueFileName,
      file.type,
      bucket // Use bucket as folder name
    );

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const bucket = searchParams.get('bucket') || 'general';

    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Only allow users to delete their own files
    if (!fileName.startsWith(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 });
    }

    // Delete from Backblaze B2
    await deleteFromB2(fileName, bucket);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
