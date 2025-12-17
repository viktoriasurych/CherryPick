const db = require('../config/db');

class DictionaryDAO {
    
    getAll(tableName, userId) {
        return new Promise((resolve, reject) => {
            // Вибираємо загальні (NULL) або особисті (userId)
            const sql = `SELECT id, name, user_id FROM ${tableName} WHERE user_id IS NULL OR user_id = ? ORDER BY name`;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    create(tableName, name, userId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ${tableName} (name, user_id) VALUES (?, ?)`;
            db.run(sql, [name, userId], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, user_id: userId });
            });
        });
    }

    delete(tableName, id, userId) {
        return new Promise((resolve, reject) => {
            // Видаляємо ТІЛЬКИ якщо це створив цей юзер (user_id = userId)
            // Загальні (де user_id IS NULL) видаляти не можна
            const sql = `DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = new DictionaryDAO();