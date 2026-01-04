const db = require('../config/db');

class SessionDAO {

    findActive(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.*, a.title as artwork_title, a.image_path 
                FROM sessions s
                JOIN artworks a ON s.artwork_id = a.id
                WHERE s.user_id = ? AND s.end_time IS NULL
            `;
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    start(userId, artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO sessions (user_id, artwork_id, start_time, duration_seconds) VALUES (?, ?, datetime('now', 'localtime'), 0)`;
            db.run(sql, [userId, artworkId], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    pause(sessionId, accumulatedSeconds) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE sessions SET start_time = NULL, duration_seconds = ? WHERE id = ?`;
            db.run(sql, [accumulatedSeconds, sessionId], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    resume(sessionId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE sessions SET start_time = datetime('now', 'localtime') WHERE id = ?`;
            db.run(sql, [sessionId], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    stop(sessionId, finalDuration) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE sessions SET start_time = NULL, end_time = datetime('now', 'localtime'), duration_seconds = ? WHERE id = ?`;
            db.run(sql, [finalDuration, sessionId], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    createNote(sessionId, content, photoUrl) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO notes (session_id, content, photo_url) VALUES (?, ?, ?)`;
            db.run(sql, [sessionId, content, photoUrl], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    getByArtworkId(artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    s.id as session_id,
                    s.start_time, 
                    s.end_time, 
                    s.duration_seconds, 
                    s.created_at,
                    n.content as note_content, 
                    n.photo_url as note_photo
                FROM sessions s
                LEFT JOIN notes n ON s.id = n.session_id
                WHERE s.artwork_id = ? AND s.end_time IS NOT NULL
                ORDER BY s.end_time DESC
            `;
            db.all(sql, [artworkId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

    }
    
    delete(sessionId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM sessions WHERE id = ?`;
            db.run(sql, [sessionId], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    }
    
}

module.exports = new SessionDAO();