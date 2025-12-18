// client/src/services/artworkService.js
import api from '../api/axios';

const artworkService = {
    getAll: async (filters = {}) => {
        const response = await api.get('/artworks', { params: filters });
        return response.data;
    },

    create: async (data) => {
        return await artworkService._sendData('/artworks', 'post', data);
    },

    update: async (id, data) => {
        return await artworkService._sendData(`/artworks/${id}`, 'put', data);
    },

    // 👇 УНІВЕРСАЛЬНА ФУНКЦІЯ ВІДПРАВКИ (Щоб не дублювати код)
    _sendData: async (url, method, data) => {
        const formData = new FormData();
        
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        if (data.status) formData.append('status', data.status);

        if (data.style_id) formData.append('style_id', data.style_id);
        if (data.genre_id) formData.append('genre_id', data.genre_id);

        // Масиви
        if (data.material_ids && data.material_ids.length > 0) {
            formData.append('material_ids', data.material_ids.join(','));
        }
        if (data.tag_ids && data.tag_ids.length > 0) {
            formData.append('tag_ids', data.tag_ids.join(','));
        }

        // Фото
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (method === 'post' && data.image) {
             formData.append('image', data.image);
        }

        // 👇 ВИПРАВЛЕНА ЛОГІКА ДАТ
        // Ми передаємо поля, навіть якщо вони пусті ('' або null), 
        // щоб бекенд міг їх оновити.
        if (data.started) {
            formData.append('started_year', data.started.year || '');
            formData.append('started_month', data.started.month || '');
            formData.append('started_day', data.started.day || '');
        }

        if (data.finished) {
            formData.append('finished_year', data.finished.year || '');
            formData.append('finished_month', data.finished.month || '');
            formData.append('finished_day', data.finished.day || '');
        }

        const response = await api[method](url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/artworks/${id}`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/artworks/${id}`);
        return response.data;
    },

  // client/src/services/artworkService.js

    // ...

    updateStatus: async (id, status, finishedData = null) => {
        const body = { status };
        
        // Якщо є дані про дату, додаємо їх окремими полями
        if (finishedData) {
            body.finished_year = finishedData.year;
            body.finished_month = finishedData.month;
            body.finished_day = finishedData.day;
        }
        
        // Використовуємо PATCH
        const response = await api.patch(`/artworks/${id}/status`, body);
        return response.data;
    },

    // ...

    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = 'http://localhost:3000'; 
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    }
};

export default artworkService;