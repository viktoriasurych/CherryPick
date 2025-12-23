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

    stop: async (data) => {
        const formData = new FormData();
        
        if (data.manualDuration) formData.append('manualDuration', data.manualDuration);
        formData.append('content', data.content || '');
        
        // 👇 ВИПРАВЛЕНО: Ми дивимось на addToGallery, бо так ми назвали це в Timer
        // Якщо data.addToGallery true -> шлемо 'true', інакше 'false'
        const shouldAdd = data.addToGallery || data.updateCover; 
        formData.append('updateCover', shouldAdd ? 'true' : 'false');
        
        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await api.post('/sessions/stop', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },

    getHistory: async (artworkId) => {
        const response = await api.get(`/sessions/history/${artworkId}`);
        return response.data;
    },

    // 👇 НОВИЙ МЕТОД
    discard: async () => {
        const response = await api.post('/sessions/discard');
        return response.data;
    },
    // ...
};

export default sessionService;