// Configuration de l'API
const API_BASE = '/api';

// Client API avec gestion automatique du token
class ApiClient {
    constructor() {
        this.baseUrl = API_BASE;
    }

    // Obtenir le token depuis le localStorage
    getToken() {
        return localStorage.getItem('auth_token');
    }

    // Définir le token
    setToken(token) {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    // Headers par défaut
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Requête générique
    async request(endpoint, options = {}) {
        const { includeAuth = true, ...fetchOptions } = options;

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers: {
                ...this.getHeaders(includeAuth),
                ...fetchOptions.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Token expiré
            if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                this.setToken(null);
                window.location.href = '/admin/login';
            }
            throw new Error(data.error || 'Erreur serveur');
        }

        return data;
    }

    // Méthodes HTTP
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    patch(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // Upload de fichier
    async upload(endpoint, file, fieldName = 'image') {
        const formData = new FormData();
        formData.append(fieldName, file);

        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur upload');
        }

        return data;
    }
}

export const api = new ApiClient();

// API endpoints helpers
export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials, { includeAuth: false }),
    me: () => api.get('/auth/me'),
    changePassword: (data) => api.post('/auth/change-password', data),
    refresh: () => api.post('/auth/refresh'),
};

export const articlesApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/articles${query ? `?${query}` : ''}`);
    },
    get: (slug) => api.get(`/articles/${slug}`),
    getById: (id) => api.get(`/articles/by-id/${id}`),
    create: (data) => api.post('/articles', data),
    update: (id, data) => api.put(`/articles/${id}`, data),
    delete: (id) => api.delete(`/articles/${id}`),
    publish: (id, isPublished) => api.patch(`/articles/${id}/publish`, { is_published: isPublished }),
};

export const experiencesApi = {
    list: () => api.get('/experiences', { includeAuth: false }),
    create: (data) => api.post('/experiences', data),
    update: (id, data) => api.put(`/experiences/${id}`, data),
    delete: (id) => api.delete(`/experiences/${id}`),
    reorder: (orderedIds) => api.post('/experiences/reorder', { orderedIds }),
};

export const projectsApi = {
    list: (featured = false) => api.get(`/projects${featured ? '?featured=true' : ''}`, { includeAuth: false }),
    get: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    reorder: (orderedIds) => api.post('/projects/reorder', { orderedIds }),
    nextId: () => api.get('/projects/next-id'),
};

export const skillsApi = {
    list: () => api.get('/skills', { includeAuth: false }),
    listRaw: () => api.get('/skills/raw'),
    create: (data) => api.post('/skills', data),
    update: (id, data) => api.put(`/skills/${id}`, data),
    delete: (id) => api.delete(`/skills/${id}`),
    replaceCategory: (category, names) => api.put('/skills/category', { category, names }),
};

export const settingsApi = {
    list: () => api.get('/settings', { includeAuth: false }),
    get: (key) => api.get(`/settings/${key}`),
    update: (settings) => api.put('/settings', settings),
    updateOne: (key, value) => api.put(`/settings/${key}`, { value }),
};

export const uploadsApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/uploads${query ? `?${query}` : ''}`);
    },
    upload: (file) => api.upload('/uploads', file),
    delete: (filename) => api.delete(`/uploads/${filename}`),
};

export default api;