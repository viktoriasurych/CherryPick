const statsService = require('../services/statsService');

class StatsController {
    async getStats(req, res) {
        try {
            const year = req.query.year || new Date().getFullYear();
            // Беремо ID: або з запиту (для чужого профілю), або свій
            const userId = req.query.userId || req.user.id;

            const data = await statsService.getStats(userId, year);
            res.json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Помилка отримання статистики' });
        }
    }
}

module.exports = new StatsController();