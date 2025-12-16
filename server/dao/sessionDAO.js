// server/database/sessionDAO.js
const db = require('../config/db');

class SessionDAO {
    
    // 1. Почати нову сесію
    create(artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO sessions (artwork_id, start_time, is_paused) VALUES (?, datetime('now', 'localtime'), 0)`;
            db.run(sql, [artworkId], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // 2. Завершити сесію
    updateDuration(sessionId, durationSeconds) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE sessions 
                         SET end_time = datetime('now', 'localtime'), 
                             duration_seconds = ?, 
                             is_paused = 0 
                         WHERE id = ?`;
            db.run(sql, [durationSeconds, sessionId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // 3. Додати нотатку
    createNote(sessionId, content, photoUrl) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO notes (session_id, content, photo_url) VALUES (?, ?, ?)`;
            db.run(sql, [sessionId, content, photoUrl], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // 4. Історія
    getByArtworkId(artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    s.id as session_id, s.start_time, s.end_time, s.duration_seconds,
                    n.content as note_content, n.photo_url as note_photo
                FROM sessions s
                LEFT JOIN notes n ON s.id = n.session_id
                WHERE s.artwork_id = ?
                ORDER BY s.start_time DESC
            `;
            db.all(sql, [artworkId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new SessionDAO();