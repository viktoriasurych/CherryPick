const statsService = require('../services/statsService');

class StatsController {
    async getStats(req, res) {
        try {
            
            const { year, userId, type } = req.query; 
            
            const targetUserId = userId || req.user.id;
            const selectedYear = year ? parseInt(year) : new Date().getFullYear();

            const useRegistrationDate = type === 'profile';

            const stats = await statsService.getStats(targetUserId, selectedYear, useRegistrationDate);
            res.json(stats);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Помилка отримання статистики' });
        }
    }
}

module.exports = new StatsController();