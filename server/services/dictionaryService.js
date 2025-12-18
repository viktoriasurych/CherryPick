const dictionaryDAO = require('../dao/dictionaryDAO');

class DictionaryService {
    
    // Карта: тип з URL -> назва таблиці в БД
    _getTableName(type) {
        const map = {
            'styles': 'art_styles',
            'materials': 'art_materials',
            'genres': 'art_genres', // <--- Жанри тут
            'tags': 'art_tags'
        };
        return map[type];
    }

    async getAll(type, userId) {
        const tableName = this._getTableName(type);
        if (!tableName) throw new Error(`Невідомий тип довідника: ${type}`);
        
        return await dictionaryDAO.getAll(tableName, userId);
    }

    async create(type, name, userId) {
        const tableName = this._getTableName(type);
        if (!tableName) throw new Error(`Невідомий тип довідника: ${type}`);
        
        return await dictionaryDAO.create(tableName, name, userId);
    }

    async delete(type, id, userId) {
        const tableName = this._getTableName(type);
        if (!tableName) throw new Error("Невірний тип");
        
        const changes = await dictionaryDAO.delete(tableName, id, userId);
        if (changes === 0) {
            throw new Error("Не вдалося видалити (або це не ваш запис, або базовий)");
        }
        return { message: "Видалено успішно" };
    }
}

module.exports = new DictionaryService();