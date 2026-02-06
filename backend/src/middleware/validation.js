import { z } from 'zod';

const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/[<>]/g, '')
        .trim();
};

const sanitizeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
};

export const validate = (schema) => (req, res, next) => {
    try {
        const sanitized = sanitizeBody(req.body);
        schema.parse(sanitized);
        req.body = sanitized;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Données invalides',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};

function sanitizeBody(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeBody);
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[sanitizeString(key)] = sanitizeBody(value);
        }
        return result;
    }
    return obj;
}

export const loginSchema = z.object({
    username: z.string()
        .min(3, 'Nom d\'utilisateur: minimum 3 caractères')
        .max(50, 'Nom d\'utilisateur: maximum 50 caractères')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Caractères autorisés: lettres, chiffres, - et _'),
    password: z.string()
        .min(6, 'Mot de passe: minimum 6 caractères')
        .max(100, 'Mot de passe: maximum 100 caractères'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string()
        .min(8, 'Minimum 8 caractères')
        .max(100, 'Maximum 100 caractères')
        .regex(/[a-z]/, 'Au moins une minuscule')
        .regex(/[A-Z]/, 'Au moins une majuscule')
        .regex(/[0-9]/, 'Au moins un chiffre'),
});

const contentBlockSchema = z.object({
    type: z.enum(['paragraph', 'heading', 'image', 'code', 'quote', 'list']),
    content: z.string().max(50000).optional(),
    level: z.number().min(1).max(6).optional(),
    language: z.string().max(50).optional(),
    url: z.string().max(2000).optional(),
    alt: z.string().max(500).optional(),
    items: z.array(z.string().max(2000)).max(100).optional(),
});

export const articleSchema = z.object({
    title_fr: z.string().max(200, 'Titre FR trop long').optional().default(''),
    title_en: z.string().max(200, 'Titre EN trop long').optional().default(''),
    slug: z.string().max(200).regex(/^[a-z0-9-]*$/, 'Slug invalide').optional().default(''),
    excerpt_fr: z.string().max(1000, 'Extrait FR trop long').optional().default(''),
    excerpt_en: z.string().max(1000, 'Extrait EN trop long').optional().default(''),
    content_fr: z.array(contentBlockSchema).max(200).optional().default([]),
    content_en: z.array(contentBlockSchema).max(200).optional().default([]),
    cover_image: z.string().max(2000).optional().nullable(),
    tags: z.array(z.string().max(50)).max(20).optional().default([]),
    is_published: z.boolean().optional().default(false),
}).refine(
    (data) => (data.title_fr && data.title_fr.trim().length > 0) || (data.title_en && data.title_en.trim().length > 0),
    { message: 'Au moins un titre (FR ou EN) est requis', path: ['title_fr'] }
);

export const experienceSchema = z.object({
    period: z.string().min(1, 'Période requise').max(50),
    company: z.string().min(1, 'Entreprise requise').max(100),
    role_fr: z.string().max(200).optional(),
    role_en: z.string().max(200).optional(),
    description_fr: z.string().max(5000).optional(),
    description_en: z.string().max(5000).optional(),
    tech: z.array(z.string().max(50)).max(30).optional(),
    is_current: z.boolean().optional(),
    is_internship: z.boolean().optional(),
    is_apprenticeship: z.boolean().optional(),
}).refine(
    (data) => (data.role_fr && data.role_fr.trim().length > 0) || (data.role_en && data.role_en.trim().length > 0),
    { message: 'Au moins un rôle (FR ou EN) est requis', path: ['role_fr'] }
);

export const projectSchema = z.object({
    project_id: z.string().max(20).regex(/^[a-zA-Z0-9-]*$/).optional(),
    title_fr: z.string().max(200).optional(),
    title_en: z.string().max(200).optional(),
    description_fr: z.string().max(5000).optional(),
    description_en: z.string().max(5000).optional(),
    tech: z.array(z.string().max(50)).max(30).optional(),
    year: z.string().max(20).optional(),
    link: z.string().max(2000).optional().nullable(),
    image_url: z.string().max(2000).optional().nullable(),
    is_featured: z.boolean().optional(),
}).refine(
    (data) => (data.title_fr && data.title_fr.trim().length > 0) || (data.title_en && data.title_en.trim().length > 0),
    { message: 'Au moins un titre (FR ou EN) est requis', path: ['title_fr'] }
);

export const skillSchema = z.object({
    category: z.string().min(1, 'Catégorie requise').max(50),
    name: z.string().min(1, 'Nom requis').max(100),
});

export const skillCategorySchema = z.object({
    category: z.string().min(1, 'Catégorie requise').max(50),
    names: z.array(z.string().min(1).max(100)).max(50),
});

export const settingsSchema = z.record(
    z.string().max(50),
    z.union([z.string().max(5000), z.number(), z.boolean()])
);