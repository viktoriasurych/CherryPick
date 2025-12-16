import api from '../api/axios';

const sessionService = {
    // 1. Почати сесію
    start: async (artworkId) => {
        const response = await api.post('/sessions/start', { artworkId });
        return response.data; // Поверне { id: 10, status: 'STARTED' }
    },

    // 2. Завершити (з нотаткою і фото)
    finish: async (sessionId, data) => {
        const formData = new FormData();
        formData.append('duration', data.duration); // Секунди
        formData.append('content', data.content);   // Текст нотатки
        
        if (data.image) {
            formData.append('image', data.image);   // Фото прогресу
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