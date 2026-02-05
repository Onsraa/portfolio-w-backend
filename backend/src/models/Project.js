import { queryAll, queryOne, execute } from '../config/database.js';

const Project = {
    create(data) {
        const {
            project_id,
            title_fr = null,
            title_en = null,
            description_fr = null,
            description_en = null,
            tech = [],
            year = null,
            link = null,
            image_url = null,
            is_featured = false
        } = data;

        const maxOrder = queryOne('SELECT MAX(sort_order) as max FROM projects');
        const sortOrder = (maxOrder?.max || 0) + 1;
        const finalProjectId = project_id || this.generateNextId();

        const result = execute(
            `INSERT INTO projects (project_id, title_fr, title_en, description_fr, description_en, tech, year, link, image_url, is_featured, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalProjectId,
                title_fr || null,
                title_en || null,
                description_fr || null,
                description_en || null,
                JSON.stringify(Array.isArray(tech) ? tech : []),
                year || null,
                link || null,
                image_url || null,
                is_featured ? 1 : 0,
                sortOrder
            ]
        );
        return this.findById(result.lastInsertRowid);
    },

    findById(id) {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
        return project ? this.parseProject(project) : null;
    },

    findByProjectId(projectId) {
        const project = queryOne('SELECT * FROM projects WHERE project_id = ?', [projectId]);
        return project ? this.parseProject(project) : null;
    },

    findAll({ featuredOnly = false } = {}) {
        let query = 'SELECT * FROM projects';
        if (featuredOnly) {
            query += ' WHERE is_featured = 1';
        }
        query += ' ORDER BY sort_order ASC';

        const projects = queryAll(query);
        return projects.map(p => this.parseProject(p));
    },

    update(id, data) {
        const fields = [];
        const values = [];

        const stringFields = ['project_id', 'title_fr', 'title_en', 'description_fr', 'description_en', 'year', 'link', 'image_url'];
        for (const field of stringFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (data.tech !== undefined) {
            fields.push('tech = ?');
            values.push(JSON.stringify(Array.isArray(data.tech) ? data.tech : []));
        }
        if (data.is_featured !== undefined) {
            fields.push('is_featured = ?');
            values.push(data.is_featured ? 1 : 0);
        }
        if (data.sort_order !== undefined) {
            fields.push('sort_order = ?');
            values.push(parseInt(data.sort_order, 10));
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },

    delete(id) {
        return execute('DELETE FROM projects WHERE id = ?', [id]);
    },

    reorder(orderedIds) {
        if (!Array.isArray(orderedIds)) return this.findAll();

        orderedIds.forEach((id, index) => {
            const safeId = parseInt(id, 10);
            if (!isNaN(safeId)) {
                execute('UPDATE projects SET sort_order = ? WHERE id = ?', [index, safeId]);
            }
        });
        return this.findAll();
    },

    generateNextId() {
        const last = queryOne('SELECT project_id FROM projects ORDER BY project_id DESC LIMIT 1');
        if (!last || !last.project_id) return '001';

        const num = parseInt(last.project_id, 10);
        if (isNaN(num)) return '001';

        return (num + 1).toString().padStart(3, '0');
    },

    parseProject(project) {
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
            ...project,
            tech: parseJson(project.tech),
            is_featured: Boolean(project.is_featured),
        };
    },
};

export default Project;
