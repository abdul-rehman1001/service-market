/**
 * Cloudinary configuration and utilities
 * Images only - simplified and clean
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Get Cloudinary configuration for client-side image uploads
 */
export function getClientUploadConfig(folder: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  return {
    cloudName,
    uploadPreset:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      'unsigned_preset',
    folder,
    imageEndpoint: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Upload image to Cloudinary (images only)
 */
export async function uploadToCloudinaryClient(
  file: File,
  uploadPreset: string,
  folder: string
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || 'Upload failed');
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * Generate provider document folder path
 */
export function getProviderDocumentFolder(providerId: string): string {
  return `service-market/providers/${providerId}/documents`;
}