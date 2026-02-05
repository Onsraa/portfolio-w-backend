import { queryAll, queryOne, execute } from '../config/database.js';

const Article = {
    create(data) {
        const {
            title_fr = '',
            title_en = '',
            slug = '',
            excerpt_fr = '',
            excerpt_en = '',
            content_fr = [],
            content_en = [],
            cover_image = null,
            tags = [],
            is_published = false
        } = data;

        const titleForSlug = title_fr || title_en || 'article';
        let finalSlug = slug && slug.trim() ? this.sanitizeSlug(slug) : this.generateSlug(titleForSlug);

        if (this.slugExists(finalSlug)) {
            finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
        }

        const publishedAt = is_published ? new Date().toISOString() : null;

        const contentFrJson = JSON.stringify(Array.isArray(content_fr) ? content_fr : []);
        const contentEnJson = JSON.stringify(Array.isArray(content_en) ? content_en : []);
        const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

        const result = execute(
            `INSERT INTO articles (slug, title_fr, title_en, excerpt_fr, excerpt_en, content_fr, content_en, cover_image, tags, is_published, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalSlug,
                title_fr || null,
                title_en || null,
                excerpt_fr || null,
                excerpt_en || null,
                contentFrJson,
                contentEnJson,
                cover_image || null,
                tagsJson,
                is_published ? 1 : 0,
                publishedAt
            ]
        );

        return this.findById(result.lastInsertRowid);
    },

    // Vérifier si un slug existe
    slugExists(slug) {
        const existing = queryOne('SELECT id FROM articles WHERE slug = ?', [slug]);
        return existing !== null;
    },

    // Sanitizer un slug
    sanitizeSlug(slug) {
        return slug
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    },

    // Générer un slug unique à partir du titre
    generateSlug(title) {
        const baseSlug = this.sanitizeSlug(title);
        const uniqueId = Date.now().toString(36);
        return `${baseSlug}-${uniqueId}`;
    },

    // Trouver par ID
    findById(id) {
        const article = queryOne('SELECT * FROM articles WHERE id = ?', [id]);
        return article ? this.parseArticle(article) : null;
    },

    // Trouver par slug
    findBySlug(slug) {
        const article = queryOne('SELECT * FROM articles WHERE slug = ?', [slug]);
        return article ? this.parseArticle(article) : null;
    },

    // Liste tous les articles (avec pagination)
    findAll({ page = 1, limit = 10, publishedOnly = false } = {}) {
        const offset = (page - 1) * limit;

        let whereClause = '';

        if (publishedOnly) {
            whereClause = 'WHERE is_published = 1';
        }

        const articles = queryAll(
            `SELECT * FROM articles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const countResult = queryOne(`SELECT COUNT(*) as total FROM articles ${whereClause}`);
        const total = countResult ? countResult.total : 0;

        return {
            articles: articles.map(a => this.parseArticle(a)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    update(id, data) {
        const fields = [];
        const values = [];

        const stringFields = ['title_fr', 'title_en', 'slug', 'excerpt_fr', 'excerpt_en', 'cover_image'];
        for (const field of stringFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (data.content_fr !== undefined) {
            fields.push('content_fr = ?');
            values.push(JSON.stringify(Array.isArray(data.content_fr) ? data.content_fr : []));
        }
        if (data.content_en !== undefined) {
            fields.push('content_en = ?');
            values.push(JSON.stringify(Array.isArray(data.content_en) ? data.content_en : []));
        }
        if (data.tags !== undefined) {
            fields.push('tags = ?');
            values.push(JSON.stringify(Array.isArray(data.tags) ? data.tags : []));
        }
        if (data.is_published !== undefined) {
            fields.push('is_published = ?');
            values.push(data.is_published ? 1 : 0);

            if (data.is_published) {
                const existing = this.findById(id);
                if (existing && !existing.published_at) {
                    fields.push('published_at = ?');
                    values.push(new Date().toISOString());
                }
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        execute(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, values);

        return this.findById(id);
    },

    // Supprimer un article
    delete(id) {
        return execute('DELETE FROM articles WHERE id = ?', [id]);
    },

    // Incrémenter les vues
    incrementViews(id) {
        return execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
    },

    parseArticle(article) {
        const parseJson = (str, fallback = []) => {
            if (!str) return fallback;
            try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed : fallback;
            } catch {
                return fallback;
            }
        };

        return {
            ...article,
            content_fr: parseJson(article.content_fr),
            content_en: parseJson(article.content_en),
            tags: parseJson(article.tags),
            is_published: Boolean(article.is_published),
        };
    },
};

export default Article;