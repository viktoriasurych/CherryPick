import api from '../api/axios';

const quoteService = {
    /**
     * Отримати випадкову цитату від Оракула
     * GET /api/quotes/random
     */
    getRandomQuote: async () => {
        const response = await api.get('/quotes/random');
        return response.data;
    }
};

export default quoteService;