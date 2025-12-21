const db = require('../config/db');

class ViewStatsService {
    
    recordView(collectionId, userId, ipAddress) {
        return new Promise((resolve, reject) => {
            // Використовуємо db.run для SQLite
            const sql = `
                INSERT OR IGNORE INTO collection_views (collection_id, user_id, ip_address, viewed_at)
                VALUES (?, ?, ?, DATE('now')) 
            `;
            db.run(sql, [collectionId, userId || null, ipAddress], function(err) {
                if (err) console.error("Stats DB Error:", err.message);
                resolve(); // Завжди успіх, щоб не блокувати
            });
        });
    }

    getViewsCount(collectionId) {
        return new Promise((resolve, reject) => {
            // Використовуємо db.get для SQLite
            const sql = `SELECT COUNT(*) as total FROM collection_views WHERE collection_id = ?`;
            db.get(sql, [collectionId], (err, row) => {
                if (err) resolve(0);
                else resolve(row ? row.total : 0);
            });
        });
    }
}

module.exports = new ViewStatsService();