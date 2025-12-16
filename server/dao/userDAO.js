// server/dao/userDAO.js
const db = require('../config/db');

class UserDAO {
    
    // 1. Знайти користувача за Email
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // 2. Створити нового (Реєстрація)
    create(nickname, email, passwordHash) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (nickname, email, password_hash) VALUES (?, ?, ?)';
            db.run(sql, [nickname, email, passwordHash], function(err) {
                if (err) reject(err);
                // Повертаємо об'єкт створеного юзера
                resolve({ id: this.lastID, nickname, email });
            });
        });
    }

    // 3. Знайти за ID (знадобиться для профілю)
    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, nickname, email, created_at FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }
}

module.exports = new UserDAO();