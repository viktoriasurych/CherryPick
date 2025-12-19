import api from '../api/axios';

const collectionService = {
    // Отримати всі колекції (для списку)
    getAll: async () => {
        const response = await api.get('/collections');
        return response.data;
    },

    // Отримати одну колекцію за ID
    getById: async (id) => {
        const response = await api.get(`/collections/${id}`);
        return response.data;
    },

    // Створити нову колекцію
    create: async (data) => {
        const response = await api.post('/collections', data);
        return response.data;
    },

    // 👇 ОНОВЛЕНО: Редагувати саму колекцію (Назва, Опис)
    update: async (id, data) => {
        // PUT /api/collections/:id
        const response = await api.put(`/collections/${id}`, data);
        return response.data;
    },

    // Видалити колекцію
    delete: async (id) => {
        const response = await api.delete(`/collections/${id}`);
        return response.data;
    },

    // --- РОБОТА З ЕЛЕМЕНТАМИ (ITEMS) ---

    // Додати картину в колекцію
    addItem: async (collectionId, artworkId) => {
        const response = await api.post(`/collections/${collectionId}/items`, { artworkId });
        return response.data;
    },

    // Видалити картину з колекції
    removeItem: async (collectionId, artworkId) => {
        const response = await api.delete(`/collections/${collectionId}/items/${artworkId}`);
        return response.data;
    },

    // 👇 ОНОВЛЕНО: Редагувати налаштування елемента (Порядок, Макет, Контекстний опис)
    updateItem: async (itemId, data) => {
        // PUT /api/collections/items/:itemId
        // itemId - це ID запису в таблиці collection_items (link_id), а не ID картини!
        const response = await api.put(`/collections/items/${itemId}`, data);
        return response.data;
    },

    // Отримати список ID колекцій, де є ця картина (для галочок в модалці)
    getCollectionsByArtwork: async (artworkId) => {
        const response = await api.get(`/collections/artwork/${artworkId}`);
        return response.data; 
    },

    // ...
    
    // Зберегти ВСЕ за раз
    saveAll: async (id, meta, items) => {
        // items має містити: { id (це link_id), sort_order, layout_type, context_description }
        const response = await api.put(`/collections/${id}/batch`, { meta, items });
        return response.data;
    },

    uploadCover: async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/collections/${id}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteCover: async (id) => {
        const response = await api.delete(`/collections/${id}/cover`);
        return response.data;
    }
};

export default collectionService;