const quoteService = require('../services/quoteService');

class QuoteController {
    
    async getRandom(req, res) {
        try {
            const quote = await quoteService.getRandomQuote();
            res.json(quote);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "The oracle is sleeping." });
        }
    }
}

module.exports = new QuoteController();