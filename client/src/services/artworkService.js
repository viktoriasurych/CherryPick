// client/src/services/artworkService.js
import api from '../api/axios';

const artworkService = {
    getAll: async () => {
        const response = await api.get('/artworks');
        return response.data;
    },

    create: async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        
        if (data.image) {
            formData.append('image', data.image);
        }

        // 👇👇👇 ДОДАЙ ЦЕЙ БЛОК ПЕРЕВІРКИ 👇👇👇
        console.log("🔍 ПЕРЕВІРКА FORMDATA:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value); 
        }
        // 👆👆👆 ВІН ПОКАЖЕ ПРАВДУ 👆👆👆

        const response = await api.post('/artworks', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/artworks/${id}`);
        return response.data;
    },

    // ... (create, getAll, getById вже є)

    // 👇 ДОДАЙ ЦЕЙ МЕТОД: Оновити проект
    update: async (id, data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        
        // Додаємо файл, ТІЛЬКИ якщо користувач вибрав новий
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        // Використовуємо put для оновлення
        const response = await api.put(`/artworks/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // ... (delete, getImageUrl)
    delete: async (id) => {
        const response = await api.delete(`/artworks/${id}`);
        return response.data;
    },

    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:3000/${path.replace(/\\/g, '/')}`;
    }
};

export default artworkService;