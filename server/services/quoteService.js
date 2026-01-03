const quoteDAO = require('../dao/quoteDAO');

class QuoteService {
    
    async getRandomQuote() {
        const quote = await quoteDAO.getRandom();
        
        // Safety check: якщо таблиця пуста, повертаємо заглушку
        if (!quote) {
            return { content: "The void is silent today. Create more art." };
        }
        
        return quote;
    }
}

module.exports = new QuoteService();