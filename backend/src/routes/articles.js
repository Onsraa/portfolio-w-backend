import { Router } from 'express';
import { Article } from '../models/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, articleSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', optionalAuth, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const isAdmin = req.user?.role === 'admin';

    const result = Article.findAll({
      page,
      limit,
      publishedOnly: !isAdmin,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erreur liste articles:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.get('/by-id/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const article = Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error('Erreur récupération article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.get('/:slug', optionalAuth, (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Slug invalide',
      });
    }

    const article = Article.findBySlug(slug);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    const isAdmin = req.user?.role === 'admin';
    if (!article.is_published && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    if (!isAdmin) {
      Article.incrementViews(article.id);
    }

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error('Erreur détail article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.post('/', authenticate, validate(articleSchema), (req, res) => {
  try {
    const article = Article.create(req.body);

    res.status(201).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error('Erreur création article:', error);

    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Ce slug existe déjà',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur création article',
    });
  }
});

router.put('/:id', authenticate, validate(articleSchema), (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const existing = Article.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    const article = Article.update(id, req.body);

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error('Erreur mise à jour article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const existing = Article.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    Article.delete(id);

    res.json({
      success: true,
      message: 'Article supprimé',
    });
  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

router.patch('/:id/publish', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { is_published } = req.body;
    if (typeof is_published !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_published doit être un booléen',
      });
    }

    const existing = Article.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé',
      });
    }

    const article = Article.update(id, { is_published });

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error('Erreur publication article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

export default router;
