import api from '../api/axios';

const quoteService = {
    getRandomQuote: async () => {
        const response = await api.get('/quotes/random');
        return response.data;
    }
};

export default quoteService;