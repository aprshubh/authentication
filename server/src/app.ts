import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './auth/auth.routes.js';
import mediaRouter from './media/media.routes.js';
import { env } from './config/env.js';

const app = express();

// Trust only explicitly configured reverse-proxy hops; never blindly trust X-Forwarded-For.
if (env.TRUST_PROXY_HOPS > 0) {
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
}

const allowedOrigins = new Set(
  env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.vary('Origin');

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(origin && !allowedOrigins.has(origin) ? 403 : 204);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/media', mediaRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;
