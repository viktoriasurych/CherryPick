import api from '../api/axios';

const collectionService = {
    getAll: async () => {
        const response = await api.get('/collections');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/collections/${id}`);
        return response.data;
    },

    // 👇 is_public передається всередині data
    create: async (data) => {
        const response = await api.post('/collections', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/collections/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/collections/${id}`);
        return response.data;
    },

    addItem: async (collectionId, artworkId) => {
        const response = await api.post(`/collections/${collectionId}/items`, { artworkId });
        return response.data;
    },

    removeItem: async (collectionId, artworkId) => {
        const response = await api.delete(`/collections/${collectionId}/items/${artworkId}`);
        return response.data;
    },

    updateItem: async (itemId, data) => {
        const response = await api.put(`/collections/items/${itemId}`, data);
        return response.data;
    },

    getCollectionsByArtwork: async (artworkId) => {
        const response = await api.get(`/collections/artwork/${artworkId}`);
        return response.data; 
    },

    // 👇 ВАЖЛИВО: meta містить { title, description, is_public }
    saveAll: async (id, meta, items) => {
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
    },

    // 👇 Додаємо метод для публічних (знадобиться для профілю)
    getPublicCollections: async (userId) => {
        // Якщо бекенд чекає userId в параметрах запиту
        const response = await api.get('/collections/public', { params: { userId } }); 
        return response.data;
    }
};

export default collectionService;