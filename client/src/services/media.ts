import { apiClient } from '@/lib/api-client';

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

export interface AvatarUploadResponse {
  message: string;
  avatar: string;
  thumbnailUrl: string;
  fileId: string;
}

export interface DirectUploadOptions {
  file: string; // base64 or file uri
  fileName: string;
  folder?: string;
  tags?: string[];
}

export const mediaService = {
  /**
   * Fetches signed authentication parameters from server for direct ImageKit upload
   */
  getImageKitAuthParams: async (): Promise<ImageKitAuthParams> => {
    return apiClient.get<ImageKitAuthParams>('/media/imagekit-auth');
  },

  /**
   * Uploads user avatar through backend
   */
  uploadAvatar: async (
    base64File: string,
    fileName?: string
  ): Promise<AvatarUploadResponse> => {
    return apiClient.post<AvatarUploadResponse>('/media/avatar', {
      file: base64File,
      fileName,
    });
  },

  /**
   * Removes user avatar
   */
  deleteAvatar: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/media/avatar');
  },

  /**
   * Direct client-side upload to ImageKit using signed authentication parameters
   */
  directUploadToImageKit: async ({
    file,
    fileName,
    folder = '/avatars',
    tags = [],
  }: DirectUploadOptions): Promise<Record<string, unknown>> => {
    const authParams = await mediaService.getImageKitAuthParams();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('publicKey', authParams.publicKey);
    formData.append('signature', authParams.signature);
    formData.append('expire', String(authParams.expire));
    formData.append('token', authParams.token);

    if (folder) {
      formData.append('folder', folder);
    }
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ImageKit direct upload failed: ${errorText}`);
    }

    return response.json();
  },

  /**
   * Generate an optimized ImageKit URL with real-time transformations
   */
  getOptimizedImageUrl: (
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    } = {}
  ): string => {
    if (!url || !url.includes('ik.imagekit.io')) {
      return url;
    }

    const transformations: string[] = [];
    if (options.width) transformations.push(`w-${options.width}`);
    if (options.height) transformations.push(`h-${options.height}`);
    if (options.quality) transformations.push(`q-${options.quality}`);
    if (options.crop) transformations.push(`c-${options.crop}`);

    if (transformations.length === 0) return url;

    const trString = `tr:${transformations.join(',')}`;

    // Insert transformation parameter into the ImageKit URL
    const parts = url.split('/');
    const endpointIndex = parts.findIndex((part) => part.includes('ik.imagekit.io'));

    if (endpointIndex !== -1 && parts[endpointIndex + 1]) {
      parts.splice(endpointIndex + 2, 0, trString);
      return parts.join('/');
    }

    return `${url}?${trString}`;
  },
};
