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
        // userId тут може бути null (якщо гість)
        const collection = await collectionDAO.getById(id, userId);
        
        if (!collection) throw new Error("Колекцію не знайдено");

        // Перевірка приватності
        // Якщо це приватна колекція І (я не автор), то доступ заборонено
        if (!collection.is_public && (!userId || collection.user_id !== userId)) {
             throw new Error("Ця колекція є приватною");
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

    // 👇 НОВІ МЕТОДИ
    async toggleSave(collectionId, userId) {
        // Спочатку перевіримо, чи існує колекція
        const collection = await collectionDAO.getById(collectionId);
        if (!collection) throw new Error("Колекцію не знайдено");

        // Перевіримо, чи вона вже збережена. 
        // Але оскільки у нас INSERT OR IGNORE і DELETE, 
        // можна просто зробити "розумний" метод або два окремих.
        // Зробимо два окремих для ясності API.
    }

    async saveCollection(collectionId, userId) {
        return await collectionDAO.save(userId, collectionId);
    }

    async unsaveCollection(collectionId, userId) {
        return await collectionDAO.unsave(userId, collectionId);
    }

    async getSavedCollections(userId) {
        return await collectionDAO.getSaved(userId);
    }



}



module.exports = new CollectionService();