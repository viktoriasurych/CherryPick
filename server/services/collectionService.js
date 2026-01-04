const collectionDAO = require('../dao/collectionDAO');

class CollectionService {

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
        const collection = await collectionDAO.getById(id, userId);
        
        if (!collection) throw new Error("Колекцію не знайдено");
        if (!collection.is_public && (!userId || collection.user_id !== userId)) {
             throw new Error("Ця колекція є приватною");
        }

        const items = await collectionDAO.getCollectionItems(id);
        return { ...collection, items };
    }

    async updateCollection(id, userId, data) {

        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        return await collectionDAO.update(id, userId, data);
    }

    async updateCollectionItem(itemId, data) {
        return await collectionDAO.updateItem(itemId, data);
    }

    async saveCollectionChanges(id, userId, meta, items) {

        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        return await collectionDAO.updateBatch(id, userId, meta, items);
    }

    async uploadCover(id, userId, file) {

        const collection = await collectionDAO.getById(id, userId);
        if (!collection) throw new Error("Колекцію не знайдено");
        const imagePath = `uploads/${file.filename}`;
        return await collectionDAO.updateCover(id, userId, imagePath);
    }

    async removeCover(id, userId) {
        return await collectionDAO.updateCover(id, userId, null);
    }

    async getPublicCollections(userId) {
        return await collectionDAO.getPublic(userId);
    }

    async reorderCollections(items) {
        return await collectionDAO.updateCollectionsOrder(items);
    }

    async toggleSave(collectionId, userId) {
        const collection = await collectionDAO.getById(collectionId);
        if (!collection) throw new Error("Колекцію не знайдено");
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