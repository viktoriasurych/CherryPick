const collectionDAO = require('../dao/collectionDAO');

class CollectionService {
    
    // ... твої існуючі методи (create, get, delete, add/remove items) ...

    async createCollection(userId, data) {
        if (!data.title) throw new Error("Назва колекції є обов'язковою");
        return await collectionDAO.create(userId, data);
    }

    async getUserCollections(userId) {
        return await collectionDAO.getAll(userId);
    }

    async deleteCollection(id, userId) {
        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено або у вас немає прав");
        return await collectionDAO.delete(id, userId);
    }

    async addItemToCollection(collectionId, artworkId, userId) {
        const collection = await collectionDAO.getById(collectionId, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        return await collectionDAO.addItem(collectionId, artworkId);
    }

    async removeItemFromCollection(collectionId, artworkId, userId) {
        const collection = await collectionDAO.getById(collectionId, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        return await collectionDAO.removeItem(collectionId, artworkId);
    }

    async getCollectionsByArtwork(artworkId, userId) {
        return await collectionDAO.getCollectionsByArtwork(artworkId, userId);
    }

    async getCollectionDetails(id, userId) {
        // 👇 Викликаємо без userId, бо DAO тепер просто шукає по ID
        const collection = await collectionDAO.getById(id); 
        
        if (!collection) throw new Error("Колекцію не знайдено");

        // 👇 ТУТ ПЕРЕВІРКА ПРАВ (БЕЗПЕКА)
        // Якщо це НЕ моя колекція І вона НЕ публічна -> Помилка
        if (collection.user_id !== userId && !collection.is_public) {
             throw new Error("У вас немає доступу до цієї колекції");
        }

        const items = await collectionDAO.getCollectionItems(id);
        return { ...collection, items };
    }

    // 👇 ДОДАЙ ЦІ ДВА МЕТОДИ В КІНЕЦЬ КЛАСУ 👇

    async updateCollection(id, userId, data) {
        // Перевіряємо права
        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        
        return await collectionDAO.update(id, userId, data);
    }

    async updateCollectionItem(itemId, data) {
        // Тут itemId - це ID рядка в collection_items (link_id)
        return await collectionDAO.updateItem(itemId, data);
    }

    // ... інші методи ...

    async saveCollectionChanges(id, userId, meta, items) {
        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        
        return await collectionDAO.updateBatch(id, userId, meta, items);
    }

    async uploadCover(id, userId, file) {
        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");

        // 👇 ЗАЛІЗОБЕТОННИЙ ФІКС
        // Ми не покладаємось на file.path, який може бути кривим на Windows.
        // Ми просто беремо ім'я файлу і додаємо папку 'uploads/'.
        // Це завжди працюватиме правильно.
        
        const imagePath = `uploads/${file.filename}`;

        return await collectionDAO.updateCover(id, userId, imagePath);
    }

    async removeCover(id, userId) {
        // Ставимо NULL, щоб повернулась логіка "останнього фото"
        return await collectionDAO.updateCover(id, userId, null); 
    }

    async getPublicCollections(userId) {
        return await collectionDAO.getPublic(userId);
    }

    async reorderCollections(items) {
        return await collectionDAO.updateCollectionsOrder(items);
    }

}

module.exports = new CollectionService();