const quoteDAO = require('../dao/quoteDAO');

class QuoteService {
    
    async getRandomQuote() {
        const quote = await quoteDAO.getRandom();
        if (!quote) {
            return { content: "The void is silent today. Create more art." };
        }
        
        return quote;
    }
}

module.exports = new QuoteService();