const quoteService = require('../services/quoteService');

class QuoteController {
    
    async getRandom(req, res) {
        try {
            // Ми не передаємо ніяких параметрів, просто просимо рандом
            const quote = await quoteService.getRandomQuote();
            res.json(quote);
        } catch (e) {
            console.error(e);
            // Якщо щось зламалось, не показуємо юзеру страшну помилку
            res.status(500).json({ message: "The oracle is sleeping." });
        }
    }
}

module.exports = new QuoteController();