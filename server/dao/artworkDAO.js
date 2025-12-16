// server/dao/artworkDAO.js
const db = require('../config/db');

class ArtworkDAO {
    
    // 1. Створити проект
    create(userId, { title, description, image_path, status, style_id, material_id }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO artworks (user_id, title, description, image_path, status, style_id, material_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            // Якщо статус не передали, ставимо 'PLANNED' за замовчуванням
            const params = [userId, title, description, image_path, status || 'PLANNED', style_id, material_id];
            
            db.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...params });
            });
        });
    }

    // 2. Знайти всі проекти користувача
    findAllByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM artworks WHERE user_id = ? ORDER BY created_date DESC`;
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // 3. Знайти один проект (щоб перевірити власника перед редагуванням)
    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM artworks WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    // 4. Оновити проект
    update(id, userId, { title, description, status, image_path, style_id, material_id }) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE artworks 
                SET title = ?, description = ?, status = ?, image_path = ?, style_id = ?, material_id = ?
                WHERE id = ? AND user_id = ?
            `;
            const params = [title, description, status, image_path, style_id, material_id, id, userId];

            db.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve(this.changes); // Повертає кількість змінених рядків (1 або 0)
            });
        });
    }

    // 5. Видалити проект
    delete(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM artworks WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

module.exports = new ArtworkDAO();