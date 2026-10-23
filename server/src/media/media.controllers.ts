import type { RequestHandler } from 'express';
import { User } from '../auth/auth.models.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import {
  deleteFromImageKit,
  getImageKitAuthParams,
  uploadToImageKit,
} from '../services/imagekit.service.js';

export const getImageKitAuth: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    const authParams = getImageKitAuthParams();
    res.status(200).json(authParams);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate ImageKit auth params';
    res.status(500).json({ message });
  }
};

export const uploadAvatar: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { file, fileName } = req.body as { file?: string; fileName?: string };

  if (!file) {
    res.status(400).json({ message: 'Image file (base64) is required' });
    return;
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete previous avatar from ImageKit if it exists
    if (user.avatarFileId) {
      try {
        await deleteFromImageKit(user.avatarFileId);
      } catch (delError) {
        console.warn('Failed to delete old avatar:', delError);
      }
    }

    const uploadResult = await uploadToImageKit({
      file,
      fileName: fileName || `avatar_${user.id}_${Date.now()}.jpg`,
      folder: '/avatars',
    });

    user.avatar = uploadResult.url;
    user.avatarFileId = uploadResult.fileId;
    await user.save();

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      fileId: uploadResult.fileId,
    });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    const message = error instanceof Error ? error.message : 'Image upload failed';
    res.status(500).json({ message });
  }
};

export const deleteAvatar: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.avatarFileId) {
      await deleteFromImageKit(user.avatarFileId);
    }

    user.avatar = '';
    user.avatarFileId = '';
    await user.save();

    res.status(200).json({ message: 'Avatar removed successfully' });
  } catch (error) {
    console.error('Avatar deletion failed:', error);
    const message = error instanceof Error ? error.message : 'Image deletion failed';
    res.status(500).json({ message });
  }
};
