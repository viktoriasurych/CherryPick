const db = require('../config/db');

class QuoteDAO {
    
    // Отримати одну випадкову цитату
    getRandom() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT content FROM cat_quotes ORDER BY RANDOM() LIMIT 1';
            
            db.get(sql, [], (err, row) => {
                if (err) {
                    console.error("Помилка БД при отриманні цитати:", err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}

module.exports = new QuoteDAO();