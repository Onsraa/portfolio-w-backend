import { Router } from 'express';
import { User } from '../models/index.js';
import { authenticate, generateToken } from '../middleware/auth.js';
import { validate, loginSchema, changePasswordSchema } from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: config.rateLimit.loginWindowMs,
  max: config.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Réessayez plus tard.',
  },
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

    const user = User.findByUsername(username);

    if (!user || !User.verifyPassword(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants incorrects',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.get('/me', authenticate, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({
    success: true,
    data: { user: safeUser },
  });
});

router.post('/change-password', authenticate, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    const fullUser = User.findByUsername(user.username);
    if (!fullUser || !User.verifyPassword(currentPassword, fullUser.password)) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
      });
    }

    User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe modifié',
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.post('/refresh', authenticate, (req, res) => {
  const token = generateToken(req.user);
  res.json({
    success: true,
    data: { token },
  });
});

export default router;
