const dictionaryDAO = require('../dao/dictionaryDAO');

class DictionaryService {
    
    // Карта: тип з URL -> назва таблиці в БД
    _getTableMap(type) {
        const map = {
            styles: 'art_styles',
            materials: 'art_materials',
            genres: 'art_genres', // <--- Жанри тут
            tags: 'art_tags'
        };
        return map[type];
    }

    async getAll(type, userId) {
        const tableName = this._getTableMap(type);
        if (!tableName) throw new Error("Невірний тип довідника");
        
        return await dictionaryDAO.getAll(tableName, userId);
    }

    async create(type, name, userId) {
        const tableName = this._getTableMap(type);
        if (!tableName) throw new Error("Невірний тип довідника");
        
        return await dictionaryDAO.create(tableName, name, userId);
    }

    async delete(type, id, userId) {
        const tableName = this._getTableMap(type);
        if (!tableName) throw new Error("Невірний тип");
        return await dictionaryDAO.delete(tableName, id, userId);
    }
}

module.exports = new DictionaryService();