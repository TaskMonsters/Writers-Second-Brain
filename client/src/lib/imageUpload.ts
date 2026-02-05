export async function uploadImageToS3(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}

export function validateImageFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}
