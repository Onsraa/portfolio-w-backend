import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenvConfig({ path: join(__dirname, '../../.env') });

const generateSecureSecret = () => crypto.randomBytes(64).toString('hex');

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? generateSecureSecret() : null),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256',
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },

  upload: {
    maxSize: Math.min(parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), 10 * 1024 * 1024),
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    loginWindowMs: 15 * 60 * 1000,
    loginMax: 5,
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
  },

  security: {
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000,
  },
};

if (!config.isDevelopment) {
  if (!config.jwt.secret) {
    console.error('ERREUR: JWT_SECRET requis en production');
    process.exit(1);
  }

  if (!config.admin.password || config.admin.password === 'admin123') {
    console.error('ERREUR: ADMIN_PASSWORD requis en production');
    process.exit(1);
  }

  if (config.admin.password.length < 8) {
    console.error('ERREUR: ADMIN_PASSWORD doit contenir au moins 8 caractères');
    process.exit(1);
  }
}

export default config;
