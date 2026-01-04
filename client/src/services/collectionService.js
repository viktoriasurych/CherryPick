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

    getPublicCollections: async (userId) => {
        const response = await api.get('/collections/public', { params: { userId } }); 
        return response.data;
    },

    saveCollection: async (id) => {
        const response = await api.post(`/collections/${id}/save`);
        return response.data;
    },

    unsaveCollection: async (id) => {
        const response = await api.delete(`/collections/${id}/save`);
        return response.data;
    },

    getSavedCollections: async () => {
        const response = await api.get('/collections/saved');
        return response.data;
    }
};

export default collectionService;