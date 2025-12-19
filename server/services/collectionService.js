const collectionDAO = require('../dao/collectionDAO');

class CollectionService {
    
    async createCollection(userId, data) {
        // Тут можна додати валідацію, яку не варто пхати в контролер
        if (!data.title) {
            throw new Error("Назва колекції є обов'язковою");
        }
        
        // Викликаємо DAO
        return await collectionDAO.create(userId, data);
    }

    async getUserCollections(userId) {
        return await collectionDAO.getAll(userId);
    }

    async deleteCollection(id, userId) {
        // Перевіряємо, чи існує колекція, перед видаленням (логіка бізнесу)
        const collection = await collectionDAO.getById(id, userId);
        if (!collection) {
            throw new Error("Колекцію не знайдено або у вас немає прав");
        }

        return await collectionDAO.delete(id, userId);
    }
}

module.exports = new CollectionService();