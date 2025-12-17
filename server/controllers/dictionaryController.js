const dictionaryService = require('../services/dictionaryService'); // <--- ТЕПЕР ТАК

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
            const userId = req.user.id;
            const { type } = req.params;
            const { name } = req.body;

            if (!name) return res.status(400).json({ message: "Назва обов'язкова" });

            const newItem = await dictionaryService.create(type, name, userId);
            res.status(201).json(newItem);
        } catch (e) {
            // Обробка помилки UNIQUE (якщо вже існує)
            if (e.message && e.message.includes('UNIQUE')) {
                return res.status(400).json({ message: "Такий варіант вже існує" });
            }
            res.status(500).json({ message: e.message });
        }
    }

    async delete(req, res) {
        try {
            const userId = req.user.id;
            const { type, id } = req.params;
            await dictionaryService.delete(type, id, userId);
            res.json({ message: "Deleted" });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    
}

module.exports = new DictionaryController();