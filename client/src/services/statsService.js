import api from '../api/axios';

const statsService = {
    getStats: async (year) => {
        // Якщо рік не передано, сервер візьме поточний
        const params = year ? { year } : {};
        const response = await api.get('/stats', { params });
        return response.data;
    }
};

export default statsService;