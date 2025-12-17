// client/src/services/artworkService.js
import api from '../api/axios';

const artworkService = {
    // 1. Отримати всі
    getAll: async () => {
        const response = await api.get('/artworks');
        return response.data;
    },

    // 2. Створити нову картину
    create: async (data) => {
        const formData = new FormData();
        
        // Текстові поля
        formData.append('title', data.title);
        formData.append('description', data.description || '');

        // Одиночні вибори (ID)
        if (data.style_id) formData.append('style_id', data.style_id);
        if (data.genre_id) formData.append('genre_id', data.genre_id);

        // 👇 МАСИВИ (Матеріали та Теги)
        // FormData перетворить масив [1, 2] у рядок "1,2", 
        // а наш бекенд саме це і вміє читати.
        if (data.material_ids && data.material_ids.length > 0) {
            // Передаємо як рядок через кому "1,2,3"
            formData.append('material_ids', data.material_ids.join(','));
        }
        if (data.tag_ids && data.tag_ids.length > 0) {
            formData.append('tag_ids', data.tag_ids.join(','));
        }

        // Фото
        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await api.post('/artworks', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // 3. Отримати одну за ID
    getById: async (id) => {
        const response = await api.get(`/artworks/${id}`);
        return response.data;
    },

    // 4. Оновити картину
    update: async (id, data) => {
        const formData = new FormData();
        
        // Текстові поля
        formData.append('title', data.title);
        formData.append('description', data.description || '');

        // Одиночні ID
        if (data.style_id) formData.append('style_id', data.style_id);
        if (data.genre_id) formData.append('genre_id', data.genre_id);

        // 👇 МАСИВИ (важливо для редагування)
        if (data.material_ids && data.material_ids.length > 0) {
            // Передаємо як рядок через кому "1,2,3"
            formData.append('material_ids', data.material_ids.join(','));
        }
        if (data.tag_ids && data.tag_ids.length > 0) {
            formData.append('tag_ids', data.tag_ids.join(','));
        }

        // Фото (тільки якщо це новий файл)
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        const response = await api.put(`/artworks/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // 5. Видалити
    delete: async (id) => {
        const response = await api.delete(`/artworks/${id}`);
        return response.data;
    },

    // 6. Оновити статус
    updateStatus: async (id, status) => {
        const response = await api.patch(`/artworks/${id}/status`, { status });
        return response.data;
    },

    // 7. Отримати URL картинки
    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        // ⚠️ Якщо ти тестуєш на телефоні, тут має бути твій IP (наприклад 192.168.0.105)
        // Якщо тільки на компі - localhost ок.
        const baseUrl = 'http://localhost:3000'; 
        // const baseUrl = 'http://192.168.0.105:3000'; // Розкоментуй для телефону

        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    }
};

export default artworkService;