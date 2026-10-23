import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height?: number;
  width?: number;
  size?: number;
  filePath?: string;
}

export interface UploadImageOptions {
  file: string; // Base64 string or URL
  fileName: string;
  folder?: string;
}

export const getImageKitAuthParams = (): ImageKitAuthResponse => {
  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = env.IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    throw new Error('ImageKit credentials are not properly configured.');
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes expiry
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return {
    token,
    expire,
    signature,
    publicKey,
    urlEndpoint,
  };
};

export const uploadToImageKit = async ({
  file,
  fileName,
  folder = '/avatars',
}: UploadImageOptions): Promise<ImageKitUploadResponse> => {
  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  if (folder) {
    formData.append('folder', folder);
  }

  const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImageKit upload failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as ImageKitUploadResponse;
};

export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not configured.');
  }

  const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;

  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`ImageKit deletion failed (${response.status}): ${errorText}`);
  }
};
