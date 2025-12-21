const db = require('../config/db');

class UserDAO {
    
    // 1. Знайти користувача за Email (для логіну)
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
                resolve({ id: this.lastID, nickname, email });
            });
        });
    }

    // 3. Знайти за ID (Повний профіль для відображення)
    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    id, nickname, email, 
                    avatar_url, bio, location,
                    
                    contact_email, social_telegram, 
                    social_instagram, social_twitter, 
                    social_artstation, social_behance, 
                    social_website,
                    
                    -- 👇 ТЕПЕР 3 ОКРЕМИХ НАЛАШТУВАННЯ
                    show_global_stats,
                    show_kpi_stats,
                    show_heatmap_stats,
                    
                    created_at 
                FROM users WHERE id = ?`;
            
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                // Конвертуємо 1/0 в true/false для зручності фронту
                if (row) {
                    row.show_global_stats = !!row.show_global_stats;
                    row.show_kpi_stats = !!row.show_kpi_stats;
                    row.show_heatmap_stats = !!row.show_heatmap_stats;
                }
                resolve(row);
            });
        });
    }

    // 4. Оновлення текстового профілю (Виправлено помилку showStats)
    updateProfile(id, data) {
        return new Promise((resolve, reject) => {
            // Конвертуємо boolean в 1/0
            const showGlobal = data.show_global_stats ? 1 : 0;
            const showKpi = data.show_kpi_stats ? 1 : 0;
            const showHeatmap = data.show_heatmap_stats ? 1 : 0;

            const sql = `
                UPDATE users 
                SET 
                    nickname = ?, bio = ?, location = ?, 
                    contact_email = ?, social_telegram = ?,
                    social_instagram = ?, social_twitter = ?,
                    social_artstation = ?, social_behance = ?,
                    social_website = ?,
                    
                    -- 👇 ОНОВЛЮЄМО 3 ПОЛЯ
                    show_global_stats = ?,
                    show_kpi_stats = ?,
                    show_heatmap_stats = ?
                WHERE id = ?
            `;
            
            const params = [
                data.nickname, data.bio, data.location,
                data.contact_email, data.social_telegram,
                data.social_instagram, data.social_twitter,
                data.social_artstation, data.social_behance,
                data.social_website,
                showGlobal, showKpi, showHeatmap, // Нові параметри
                id
            ];

            db.run(sql, params, function(err) {
                if (err) return reject(err);
                
                // Повертаємо оновленого юзера
                const selectSql = `SELECT * FROM users WHERE id = ?`;
                db.get(selectSql, [id], (err, row) => {
                    if(err) reject(err);
                    if (row) {
                        row.show_global_stats = !!row.show_global_stats;
                        row.show_kpi_stats = !!row.show_kpi_stats;
                        row.show_heatmap_stats = !!row.show_heatmap_stats;
                    }
                    resolve(row);
                });
            });
        });
    }

    // 5. Оновлення тільки Аватара
    updateAvatar(id, avatarUrl) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
            db.run(sql, [avatarUrl, id], function(err) {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    // 6. Видалення аватара
    deleteAvatar(id) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar_url = NULL WHERE id = ?';
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    searchUsers(query) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id, nickname, avatar_url FROM users WHERE nickname LIKE ? LIMIT 5`;
            db.all(sql, [`%${query}%`], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // 👇 1. НОВІ МЕТОДИ ДЛЯ GOOGLE
    // 👇 ТРЕБА (правильно):
    createFromGoogle(nickname, email, passwordHash, googleId, avatarUrl) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (nickname, email, password_hash, google_id, avatar_url) VALUES (?, ?, ?, ?, ?)`;
            
            // ВАЖЛИВО: Тут має бути 'function(err)', а не '(err) =>'
            db.run(sql, [nickname, email, passwordHash, googleId, avatarUrl], function(err) {
                if (err) {
                    // Якщо помилка (наприклад, такий нік вже є), повертаємо її
                    return reject(err); 
                }
                // Тепер 'this' посилається на Statement об'єкт sqlite, де є lastID
                resolve({ 
                    id: this.lastID, 
                    nickname, 
                    email, 
                    google_id: googleId, 
                    avatar_url: avatarUrl 
                });
            });
        });
    }

    linkGoogleId(userId, googleId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET google_id = ? WHERE id = ?';
            db.run(sql, [googleId, userId], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    // 👇 2. НОВІ МЕТОДИ ДЛЯ PASSWORD RESET
    saveResetToken(email, token, expiresAt) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`;
            db.run(sql, [email, token, expiresAt], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    findResetToken(email, token) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM password_resets WHERE email = ? AND token = ?`;
            db.get(sql, [email, token], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    deleteResetToken(email) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM password_resets WHERE email = ?`;
            db.run(sql, [email], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    updatePassword(email, newHash) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET password_hash = ? WHERE email = ?`;
            db.run(sql, [newHash, email], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    
}

module.exports = new UserDAO();