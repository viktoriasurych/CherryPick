const db = require('../config/db');

class CollectionDAO {

    // Створити колекцію
    create(userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO collections (user_id, title, description, type) VALUES (?, ?, ?, ?)`;
            db.run(sql, [userId, data.title, data.description, data.type], function(err) {
                if (err) return reject(err);
                
                // Повертаємо створений об'єкт
                resolve({ 
                    id: this.lastID, 
                    user_id: userId,
                    ...data,
                    item_count: 0 // Нова колекція завжди пуста
                });
            });
        });
    }

    // Отримати всі колекції користувача (з підрахунком кількості картин)
    getAll(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.*, 
                    COUNT(ci.id) as item_count 
                FROM collections c 
                LEFT JOIN collection_items ci ON c.id = ci.collection_id 
                WHERE c.user_id = ? 
                GROUP BY c.id 
                ORDER BY c.created_at DESC
            `;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // Отримати одну колекцію за ID
    getById(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM collections WHERE id = ? AND user_id = ?`;
            db.get(sql, [id, userId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    // Видалити колекцію
    delete(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM collections WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = new CollectionDAO();