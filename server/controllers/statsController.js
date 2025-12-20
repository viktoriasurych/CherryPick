const statsService = require('../services/statsService');

class StatsController {
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            
            // Якщо в URL немає ?year=, ми все одно передаємо поточний рік 
            // для блоку "Хронологія", але сервіс тепер поверне і Global дані також.
            const year = req.query.year || new Date().getFullYear();

            // Викликаємо сервіс, який тепер збирає ВЕСЬ пакет даних
            const data = await statsService.getDashboardStats(userId, year);
            
            res.json(data);
        } catch (e) {
            // Це допоможе нам в консолі сервера побачити, який саме запит (жанри, теги чи сесії) зламався
            console.error("ОЙ! Помилка в StatsController:", e); 
            res.status(500).json({ 
                message: "Помилка при зборі аналітики",
                error: e.message 
            });
        }
    }
}

module.exports = new StatsController();