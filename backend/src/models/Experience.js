import { queryAll, queryOne, execute } from '../config/database.js';

const Experience = {
    create(data) {
        const {
            period,
            company,
            role_fr = null,
            role_en = null,
            description_fr = null,
            description_en = null,
            tech = [],
            is_current = false,
            is_internship = false
        } = data;

        const maxOrder = queryOne('SELECT MAX(sort_order) as max FROM experiences');
        const sortOrder = (maxOrder?.max || 0) + 1;

        const result = execute(
            `INSERT INTO experiences (period, company, role_fr, role_en, description_fr, description_en, tech, is_current, is_internship, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                period,
                company,
                role_fr || null,
                role_en || null,
                description_fr || null,
                description_en || null,
                JSON.stringify(Array.isArray(tech) ? tech : []),
                is_current ? 1 : 0,
                is_internship ? 1 : 0,
                sortOrder
            ]
        );
        return this.findById(result.lastInsertRowid);
    },

    findById(id) {
        const exp = queryOne('SELECT * FROM experiences WHERE id = ?', [id]);
        return exp ? this.parseExperience(exp) : null;
    },

    findAll() {
        const experiences = queryAll('SELECT * FROM experiences ORDER BY sort_order ASC');
        return experiences.map(e => this.parseExperience(e));
    },

    update(id, data) {
        const fields = [];
        const values = [];

        const stringFields = ['period', 'company', 'role_fr', 'role_en', 'description_fr', 'description_en'];
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
        if (data.is_current !== undefined) {
            fields.push('is_current = ?');
            values.push(data.is_current ? 1 : 0);
        }
        if (data.is_internship !== undefined) {
            fields.push('is_internship = ?');
            values.push(data.is_internship ? 1 : 0);
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

        execute(`UPDATE experiences SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },

    delete(id) {
        return execute('DELETE FROM experiences WHERE id = ?', [id]);
    },

    reorder(orderedIds) {
        if (!Array.isArray(orderedIds)) return this.findAll();

        orderedIds.forEach((id, index) => {
            const safeId = parseInt(id, 10);
            if (!isNaN(safeId)) {
                execute('UPDATE experiences SET sort_order = ? WHERE id = ?', [index, safeId]);
            }
        });
        return this.findAll();
    },

    parseExperience(exp) {
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
            ...exp,
            tech: parseJson(exp.tech),
            is_current: Boolean(exp.is_current),
            is_internship: Boolean(exp.is_internship),
        };
    },
};

export default Experience;
