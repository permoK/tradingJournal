import B2 from 'backblaze-b2';

// Backblaze B2 client instance
let b2Client: B2 | null = null;

// Initialize B2 client
async function getB2Client(): Promise<B2> {
  if (!b2Client) {
    const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;

    console.log('Initializing B2 client with:');
    console.log('Application Key ID:', applicationKeyId);
    console.log('Application Key length:', applicationKey?.length);

    if (!applicationKeyId || !applicationKey) {
      throw new Error('Backblaze B2 credentials not configured. Please set B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY in your environment variables.');
    }

    b2Client = new B2({
      applicationKeyId,
      applicationKey,
    });

    try {
      console.log('Attempting to authorize B2 client...');
      const authResult = await b2Client.authorize();
      console.log('B2 authorization successful:', authResult);
    } catch (error) {
      console.error('Failed to authorize Backblaze B2 client:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to authorize with Backblaze B2. Please check your credentials.');
    }
  }

  return b2Client;
}

// Upload file to B2
export async function uploadToB2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = ''
): Promise<string> {
  try {
    const b2 = await getB2Client();
    const bucketId = process.env.B2_BUCKET_ID;
    const bucketName = process.env.B2_BUCKET_NAME;

    if (!bucketId || !bucketName) {
      throw new Error('Backblaze B2 bucket configuration missing. Please set B2_BUCKET_ID and B2_BUCKET_NAME.');
    }

    // Create the full file path with folder
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucketId,
    });

    // Upload the file
    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: fullFileName,
      data: file,
      info: {
        'Content-Type': contentType,
      },
    });

    // Return the public URL
    const downloadUrl = process.env.NEXT_PUBLIC_B2_DOWNLOAD_URL;
    if (!downloadUrl) {
      throw new Error('B2 download URL not configured. Please set NEXT_PUBLIC_B2_DOWNLOAD_URL.');
    }

    return `${downloadUrl}/${fullFileName}`;
  } catch (error) {
    console.error('Error uploading to Backblaze B2:', error);
    throw new Error(`Failed to upload file to Backblaze B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete file from B2
export async function deleteFromB2(fileName: string, folder: string = ''): Promise<void> {
  try {
    const b2 = await getB2Client();
    const bucketId = process.env.B2_BUCKET_ID;

    if (!bucketId) {
      throw new Error('Backblaze B2 bucket ID not configured.');
    }

    // Create the full file path with folder
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;

    // List file versions to get the file ID
    const listResponse = await b2.listFileVersions({
      bucketId: bucketId,
      startFileName: fullFileName,
      maxFileCount: 1,
    });

    const file = listResponse.data.files.find((f: any) => f.fileName === fullFileName);
    
    if (file) {
      await b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: fullFileName,
      });
    }
  } catch (error) {
    console.error('Error deleting from Backblaze B2:', error);
    throw new Error(`Failed to delete file from Backblaze B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a unique filename
export function generateUniqueFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${userId}_${timestamp}_${randomString}.${extension}`;
}

// Validate file type and size
export function validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size too large. Please upload an image smaller than ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

// Convert File to Buffer (for server-side use)
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
