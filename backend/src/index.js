import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import config from './config/index.js';
import { initDatabase } from './config/database.js';
import routes from './routes/index.js';
import { User, Settings } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  await initDatabase();
  Settings.initDefaults();

  // Auto-create admin from .env if no admin exists yet
  if (!User.adminExists() && config.admin.password) {
    try {
      User.create({
        username: config.admin.username,
        email: config.admin.email,
        password: config.admin.password,
      });
      console.log(`✓ Administrateur créé: ${config.admin.username}`);
    } catch (err) {
      if (!err.message?.includes('UNIQUE')) {
        console.error('Erreur création admin:', err.message);
      }
    }
  }

  const app = express();

  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  const allowedOrigins = config.cors.origin
    ? (Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin])
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || config.isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error('CORS non autorisé'));
      }
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }));

  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Trop de requêtes. Réessayez plus tard.',
    },
    skip: (req) => req.ip === '127.0.0.1' && config.isDevelopment,
  }));

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.use('/uploads', express.static(join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  }));

  app.use('/api', routes);

  // In production, serve the built frontend
  const frontendDist = join(__dirname, '../../frontend/dist');
  if (!config.isDevelopment && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(join(frontendDist, 'index.html'));
    });
  } else {
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route non trouvée',
      });
    });
  }

  app.use((err, req, res, next) => {
    if (config.isDevelopment) {
      console.error('Erreur:', err);
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Fichier trop volumineux',
      });
    }

    if (err.message === 'CORS non autorisé') {
      return res.status(403).json({
        success: false,
        error: 'Origine non autorisée',
      });
    }

    res.status(err.status || 500).json({
      success: false,
      error: config.isDevelopment ? err.message : 'Erreur serveur',
    });
  });

  const server = app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   Serveur Portfolio démarré                              ║
║   URL:  http://localhost:${config.port}                        ║
║   Mode: ${config.nodeEnv.padEnd(12)}                           ║
╚══════════════════════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} déjà utilisé. Arrêtez l'autre instance ou changez le port.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer().catch(console.error);
