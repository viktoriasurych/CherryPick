const collectionService = require('../services/collectionService'); // 👇 ТУТ ЗМІНА (був DAO)

class CollectionController {
    
    // POST /api/collections
    async create(req, res) {
        try {
            const userId = req.user.id;
            const { title, description, type } = req.body;

            // Валідація вхідних даних (HTTP рівень)
            if (!['MOODBOARD', 'SERIES', 'EXHIBITION'].includes(type)) {
                return res.status(400).json({ message: "Невірний тип колекції" });
            }

            // 👇 Викликаємо СЕРВІС
            const newCollection = await collectionService.createCollection(userId, { title, description, type });
            
            res.status(201).json(newCollection);
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }

    // GET /api/collections
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            // 👇 Викликаємо СЕРВІС
            const collections = await collectionService.getUserCollections(userId);
            res.json(collections);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message });
        }
    }

    // DELETE /api/collections/:id
    async delete(req, res) {
        try {
            const userId = req.user.id;
            const collectionId = req.params.id;

            // 👇 Викликаємо СЕРВІС
            await collectionService.deleteCollection(collectionId, userId);
            
            res.json({ message: "Колекцію видалено" });
        } catch (e) {
            console.error(e);
            // Якщо помилка "не знайдено", повертаємо 404, інакше 500
            if (e.message.includes('не знайдено')) {
                res.status(404).json({ message: e.message });
            } else {
                res.status(500).json({ message: e.message });
            }
        }
    }
}

module.exports = new CollectionController();