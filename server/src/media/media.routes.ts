import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import {
  deleteAvatar,
  getImageKitAuth,
  uploadAvatar,
} from './media.controllers.js';

const mediaRouter = Router();

mediaRouter.get('/imagekit-auth', authenticate, getImageKitAuth);
mediaRouter.post('/avatar', authenticate, uploadAvatar);
mediaRouter.delete('/avatar', authenticate, deleteAvatar);

export default mediaRouter;
