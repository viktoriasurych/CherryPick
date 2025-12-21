import api from '../api/axios';

const statsService = {
    // 👇 Додали userId
    getStats: async (year, userId) => {
        // Якщо userId передали, додаємо його в параметри
        const params = { year };
        if (userId) {
            params.userId = userId;
        }

        const response = await api.get('/stats', { params });
        return response.data;
    }
};

export default statsService;