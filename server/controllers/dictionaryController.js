const dictionaryService = require('../services/dictionaryService');
const { validate } = require('../utils/validation'); // 👇 1. Імпорт

class DictionaryController {
    
    // GET /api/dict/:type
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const { type } = req.params;
            
            const list = await dictionaryService.getAll(type, userId);
            res.json(list);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    // POST /api/dict/:type
    async create(req, res) {
        try {
            // 👇 2. ВАЛІДАЦІЯ
            const errors = validate.dictionary(req.body);
            if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

            const userId = req.user.id;
            const { type } = req.params;
            const { name } = req.body;

            if (!name) return res.status(400).json({ message: "Назва обов'язкова" });

            const newItem = await dictionaryService.create(type, name, userId);
            res.status(201).json(newItem);
        } catch (e) {
            if (e.message && e.message.includes('UNIQUE')) {
                return res.status(400).json({ message: "Такий варіант вже існує" });
            }
            res.status(500).json({ message: e.message });
        }
    }

    // DELETE /api/dict/:type/:id
    async delete(req, res) {
        try {
            const userId = req.user.id;
            const { type, id } = req.params;
            
            await dictionaryService.delete(type, id, userId);
            res.json({ message: "Deleted" });
        } catch (e) {
            res.status(400).json({ message: e.message }); // 400, бо це помилка логіки (не можна видаляти чуже)
        }
    }
}

module.exports = new DictionaryController();