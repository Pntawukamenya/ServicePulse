const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.secure_url;
}
