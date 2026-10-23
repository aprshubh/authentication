import { model, Schema } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  avatar?: string;
  avatarFileId?: string;
  refreshToken?: string;
  sessionId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationCode?: string;
  verificationExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    avatar: {
      type: String,
      required: false,
      default: '',
    },
    avatarFileId: {
      type: String,
      required: false,
      default: '',
    },
    refreshToken: {
      type: String,
      required: false,
      default: '',
    },
    sessionId: {
      type: String,
      required: false,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
