import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .default(process.env.mongodb_uri || 'mongodb://localhost:27017/authentication'),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),

  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),

  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:8081,http://localhost:19006'),

  // Resend Email Service
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY cannot be empty').optional(),
  RESEND_FROM_EMAIL: z.string().min(1, 'RESEND_FROM_EMAIL cannot be empty').optional(),

  // ImageKit Media Service
  IMAGEKIT_PUBLIC_KEY: z.string().min(1, 'IMAGEKIT_PUBLIC_KEY cannot be empty').optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, 'IMAGEKIT_PRIVATE_KEY cannot be empty').optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().min(1, 'IMAGEKIT_URL_ENDPOINT cannot be empty').optional(),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const result = envSchema.safeParse({
  MONGO_URI: process.env.MONGO_URI || process.env.mongodb_uri,
  ...process.env,
});

if (!result.success) {
  console.error('Invalid environment variables:');
  console.error(z.treeifyError(result.error));
  process.exit(1);
}

export const env = result.data;
