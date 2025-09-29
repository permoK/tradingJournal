import { uploadToB2, generateUniqueFileName } from './backblaze';

/**
 * Download an image from a URL and return it as a Buffer
 */
export async function downloadImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image from URL');
  }
}

/**
 * Process and upload a Google profile image to Backblaze B2
 */
export async function processGoogleAvatar(
  googleImageUrl: string,
  userId: string,
  userName?: string | null
): Promise<string | null> {
  try {
    // Skip if no image URL provided
    if (!googleImageUrl) {
      return null;
    }

    // Download the image from Google
    const imageBuffer = await downloadImageFromUrl(googleImageUrl);
    
    // Generate a unique filename for the avatar
    const fileName = generateUniqueFileName(
      `${userName || 'user'}-avatar.jpg`,
      userId
    );
    
    // Upload to Backblaze B2 in the avatars folder
    await uploadToB2(
      imageBuffer,
      fileName,
      'image/jpeg',
      'avatars'
    );

    // Return proxy URL for private bucket access
    // Use full URL to ensure it works in all contexts
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    return `${baseUrl}/api/avatar/${fileName}`;
  } catch (error) {
    console.error('Error processing Google avatar:', error);
    // Return null instead of throwing to not block the sign-in process
    return null;
  }
}

/**
 * Validate avatar file before upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.'
    };
  }

  return { valid: true };
}

/**
 * Process and upload a user-uploaded avatar file
 */
export async function processUserAvatar(
  file: File,
  userId: string
): Promise<string> {
  try {
    // Validate the file
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Generate a unique filename
    const fileName = generateUniqueFileName(file.name, userId);
    
    // Upload to Backblaze B2 in the avatars folder
    await uploadToB2(
      fileBuffer,
      fileName,
      file.type,
      'avatars'
    );

    // Return proxy URL for private bucket access
    // Use full URL to ensure it works in all contexts
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    return `${baseUrl}/api/avatar/${fileName}`;
  } catch (error) {
    console.error('Error processing user avatar:', error);
    throw error;
  }
}

/**
 * Get avatar URL with fallback handling
 */
export function getAvatarUrl(avatarUrl?: string | null): string | null {
  if (!avatarUrl) return null;

  // If it's already a full proxy URL, return as is
  if (avatarUrl.includes('/api/avatar/')) {
    return avatarUrl;
  }

  // If it's a relative proxy URL, convert to full URL
  if (avatarUrl.startsWith('/api/avatar/')) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    return `${baseUrl}${avatarUrl}`;
  }

  // If it's already a Backblaze URL, return as is
  if (avatarUrl.includes(process.env.NEXT_PUBLIC_B2_DOWNLOAD_URL || '')) {
    return avatarUrl;
  }

  // If it's a Google URL or other external URL, return as is for now
  // (This will be migrated to Backblaze during the next sign-in)
  return avatarUrl;
}
