const db = require('../config/db');

class ViewStatsDAO {
    
    create(collectionId, userId, ipAddress) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR IGNORE INTO collection_views (collection_id, user_id, ip_address, viewed_at)
                VALUES (?, ?, ?, DATE('now')) 
            `;
            db.run(sql, [collectionId, userId || null, ipAddress], function(err) {
                if (err) {
                    console.error("ViewStatsDAO Insert Error:", err.message);
                    resolve(null); 
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    countByCollectionId(collectionId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as total FROM collection_views WHERE collection_id = ?`;
            db.get(sql, [collectionId], (err, row) => {
                if (err) {
                    console.error("ViewStatsDAO Count Error:", err.message);
                    resolve(0);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }
}

module.exports = new ViewStatsDAO();