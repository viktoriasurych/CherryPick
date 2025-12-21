import api from '../api/axios';

const statsService = {
    // 👇 ДОДАЙ ТРЕТІЙ ПАРАМЕТР: isProfile
    getStats: async (year, userId = null, isProfile = false) => {
        const params = { year };
        
        if (userId) params.userId = userId;
        
        // 👇 ЯКЩО ЦЕ ПРОФІЛЬ, ДОДАЄМО ПАРАМЕТР type
        if (isProfile) {
            params.type = 'profile';
        }

        const response = await api.get('/stats', { params });
        return response.data;
    }
};

export default statsService;