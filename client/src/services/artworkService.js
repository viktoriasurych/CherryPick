import api from '../api/axios';

const artworkService = {
    getAll: async (filters = {}, sort = { by: 'updated', dir: 'DESC' }) => { // Додали sort
        const params = new URLSearchParams();
        
        // ... (код обробки фільтрів) ...
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (Array.isArray(value) && value.length > 0) {
                params.append(key, value.join(',')); 
            } else if (value && !Array.isArray(value)) {
                params.append(key, value);
            }
        });

        // 👇 ДОДАЄМО СОРТУВАННЯ В ЗАПИТ
        params.append('sortBy', sort.by);
        params.append('sortDir', sort.dir);

        const response = await api.get('/artworks', { params });
        return response.data;
    },

    create: async (data) => {
        return await artworkService._sendData('/artworks', 'post', data);
    },

    update: async (id, data) => {
        return await artworkService._sendData(`/artworks/${id}`, 'put', data);
    },

    addGalleryImage: async (id, file, description = '') => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', description);
        
        const response = await api.post(`/artworks/${id}/gallery`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteGalleryImage: async (imgId) => {
        const response = await api.delete(`/artworks/gallery/${imgId}`);
        return response.data;
    },

    _sendData: async (url, method, data) => {
        const formData = new FormData();
        
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        if (data.status) formData.append('status', data.status);
        if (data.style_id) formData.append('style_id', data.style_id);
        if (data.genre_id) formData.append('genre_id', data.genre_id);

        if (data.material_ids && data.material_ids.length > 0) {
            formData.append('material_ids', data.material_ids.join(','));
        }
        if (data.tag_ids && data.tag_ids.length > 0) {
            formData.append('tag_ids', data.tag_ids.join(','));
        }

        // 👇 ВИПРАВЛЕНО: Тільки один блок обробки фото
        if (data.image instanceof File) {
            // Це новий файл (об'єкт File)
            formData.append('image', data.image); 
        } else if (typeof data.image === 'string' && data.image.startsWith('uploads/')) {
            // Це старий шлях (string), передаємо як текст, щоб сервер знав
            formData.append('image_path', data.image);
        }

        // Дати
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

    updateStatus: async (id, status, finishedData = null) => {
        const body = { status };
        if (finishedData) {
            body.finished_year = finishedData.year;
            body.finished_month = finishedData.month;
            body.finished_day = finishedData.day;
        }
        const response = await api.patch(`/artworks/${id}/status`, body);
        return response.data;
    },

    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = 'http://localhost:3000'; 
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    }
};

export default artworkService;