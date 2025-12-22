const db = require('../config/db');

class StickyNoteDAO {
    
    getAll(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM sticky_notes WHERE user_id = ? ORDER BY updated_at DESC`;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    create(userId, data) {
        return new Promise((resolve, reject) => {
            const { title, content, color } = data;
            const sql = `INSERT INTO sticky_notes (user_id, title, content, color) VALUES (?, ?, ?, ?)`;
            db.run(sql, [userId, title, content, color], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, user_id: userId, title, content, color, updated_at: new Date() });
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM sticky_notes WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            const { title, content, color } = data;
            const sql = `
                UPDATE sticky_notes 
                SET title = ?, content = ?, color = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            db.run(sql, [title, content, color, id], function(err) {
                if (err) reject(err);
                else resolve({ message: "Updated" });
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM sticky_notes WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve({ message: "Deleted" });
            });
        });
    }
}

module.exports = new StickyNoteDAO();