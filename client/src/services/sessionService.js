import api from '../api/axios';

const sessionService = {
    // 1. Почати сесію
    start: async (artworkId) => {
        const response = await api.post('/sessions/start', { artworkId });
        return response.data; 
    },

    // 2. Завершити (з нотаткою, фото і галочкою updateCover)
    finish: async (sessionId, data) => {
        const formData = new FormData();
        
        formData.append('duration', data.duration);
        formData.append('content', data.content || '');
        
        // 👇 ВАЖЛИВО: Передаємо ID картини та стан галочки
        formData.append('artworkId', data.artworkId);
        formData.append('updateCover', data.updateCover); // true або false
        
        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await api.post(`/sessions/${sessionId}/finish`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // 3. Отримати історію
    getHistory: async (artworkId) => {
        const response = await api.get(`/sessions/history/${artworkId}`);
        return response.data;
    }
};

export default sessionService;