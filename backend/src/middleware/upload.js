import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/index.js';
import { queryAll, queryOne, execute } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de stockage temporaire
const storage = multer.memoryStorage();

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.'), false);
  }
};

// Configuration multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
  },
});

// Traitement et sauvegarde de l'image
export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `${uuidv4()}.webp`;
    const filepath = join(uploadsDir, filename);
    
    // Obtenir les métadonnées de l'image originale
    const metadata = await sharp(req.file.buffer).metadata();
    
    // Redimensionner et convertir en WebP
    let image = sharp(req.file.buffer);
    
    // Limiter la taille maximale à 1920px
    if (metadata.width > 1920 || metadata.height > 1920) {
      image = image.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // Sauvegarder en WebP optimisé
    await image
      .webp({ quality: 85 })
      .toFile(filepath);
    
    // Obtenir les nouvelles dimensions
    const newMetadata = await sharp(filepath).metadata();
    
    // Enregistrer en base de données
    const stats = fs.statSync(filepath);
    const result = execute(
      `INSERT INTO images (filename, original_name, mime_type, size, width, height)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [filename, req.file.originalname, 'image/webp', stats.size, newMetadata.width, newMetadata.height]
    );
    
    // Ajouter les infos à la requête
    req.uploadedImage = {
      id: result.lastInsertRowid,
      filename,
      url: `/uploads/images/${filename}`,
      width: newMetadata.width,
      height: newMetadata.height,
      size: stats.size,
    };
    
    next();
  } catch (error) {
    console.error('Erreur de traitement d\'image:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du traitement de l\'image',
    });
  }
};

// Supprimer une image
export const deleteImage = (filename) => {
  // Sanitize filename to prevent path traversal
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safeName || safeName !== filename) {
    throw new Error('Nom de fichier invalide');
  }

  const filepath = join(uploadsDir, safeName);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  execute('DELETE FROM images WHERE filename = ?', [safeName]);
};

// Lister les images
export const listImages = ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  
  const images = queryAll(
    `SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  
  const countResult = queryOne('SELECT COUNT(*) as total FROM images');
  const total = countResult ? countResult.total : 0;
  
  return {
    images: images.map(img => ({
      ...img,
      url: `/uploads/images/${img.filename}`,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
