const statsService = require('../services/statsService');

class StatsController {
    async getStats(req, res) {
        try {
            // 👇 Читаємо параметри:
            // year: рік
            // userId: ID юзера (для перегляду чужого профілю)
            // type: 'profile' (якщо це запит з профілю)
            
            const { year, userId, type } = req.query; 
            
            // Якщо userId передано в query (наприклад, ?userId=5), беремо його.
            // Якщо ні — беремо поточного авторизованого (req.user.id).
            const targetUserId = userId || req.user.id;
            
            const selectedYear = year ? parseInt(year) : new Date().getFullYear();
            
            // 👇 Якщо type === 'profile', то useRegistrationDate = true
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