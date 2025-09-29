import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3-compatible client for Backblaze B2
let s3Client: S3Client | null = null;

// Initialize S3 client for Backblaze B2
function getS3Client(): S3Client {
  if (!s3Client) {
    const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;
    const endpoint = `https://s3.us-east-005.backblazeb2.com`; // Using the endpoint from your credentials

    if (!applicationKeyId || !applicationKey) {
      throw new Error('Backblaze B2 credentials not configured. Please set B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY in your environment variables.');
    }

    s3Client = new S3Client({
      endpoint,
      region: 'us-east-005', // Backblaze B2 region
      credentials: {
        accessKeyId: applicationKeyId,
        secretAccessKey: applicationKey,
      },
      forcePathStyle: true, // Required for Backblaze B2
    });
  }

  return s3Client;
}

// Upload file to B2 using S3-compatible API
export async function uploadToB2S3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = ''
): Promise<string> {
  try {
    const s3 = getS3Client();
    const bucketName = process.env.B2_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('Backblaze B2 bucket name not configured. Please set B2_BUCKET_NAME.');
    }

    // Create the full file path with folder
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fullFileName,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    });

    await s3.send(command);

    // Return the public URL
    const downloadUrl = process.env.NEXT_PUBLIC_B2_DOWNLOAD_URL;
    if (!downloadUrl) {
      throw new Error('B2 download URL not configured. Please set NEXT_PUBLIC_B2_DOWNLOAD_URL.');
    }

    return `${downloadUrl}/${fullFileName}`;
  } catch (error) {
    console.error('Error uploading to Backblaze B2 (S3):', error);
    throw new Error(`Failed to upload file to Backblaze B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete file from B2 using S3-compatible API
export async function deleteFromB2S3(fileName: string, folder: string = ''): Promise<void> {
  try {
    const s3 = getS3Client();
    const bucketName = process.env.B2_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('Backblaze B2 bucket name not configured.');
    }

    // Create the full file path with folder
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fullFileName,
    });

    await s3.send(command);
  } catch (error) {
    console.error('Error deleting from Backblaze B2 (S3):', error);
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
