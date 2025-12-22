import api from '../api/axios';

const sessionService = {
    getCurrent: async () => {
        const response = await api.get('/sessions/current');
        return response.data;
    },

    start: async (artworkId) => {
        const response = await api.post('/sessions/start', { artworkId });
        return response.data; 
    },

    togglePause: async () => {
        const response = await api.post('/sessions/pause');
        return response.data;
    },

    // 👇 ГОЛОВНЕ ВИПРАВЛЕННЯ ТУТ
    stop: async (data) => {
        const formData = new FormData();
        
        if (data.manualDuration) formData.append('manualDuration', data.manualDuration);
        formData.append('content', data.content || '');
        formData.append('updateCover', data.updateCover ? 'true' : 'false');
        
        if (data.image) {
            formData.append('image', data.image);
        }

        // 👇 ЯВНО ВКАЗУЄМО, ЩО ЦЕ ФОРМА З ФАЙЛОМ
        const response = await api.post('/sessions/stop', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },

    getHistory: async (artworkId) => {
        const response = await api.get(`/sessions/history/${artworkId}`);
        return response.data;
    }
};

export default sessionService;