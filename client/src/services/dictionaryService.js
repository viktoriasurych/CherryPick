import api from '../api/axios';

const dictionaryService = {
    // Отримати список (type = styles, materials, genres)
    getAll: async (type) => {
        const response = await api.get(`/dict/${type}`);
        return response.data;
    },

    // Створити новий запис
    create: async (type, name) => {
        const response = await api.post(`/dict/${type}`, { name });
        return response.data;
    },

    delete: async (type, id) => {
        const response = await api.delete(`/dict/${type}/${id}`);
        return response.data;
    }
};

export default dictionaryService;