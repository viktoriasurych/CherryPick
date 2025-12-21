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
                    
                    -- Контакти
                    contact_email, social_telegram, 
                    social_instagram, social_twitter, 
                    social_artstation, social_behance, 
                    social_website,
                    
                    -- Налаштування
                    show_stats_public, 
                    
                    created_at 
                FROM users WHERE id = ?`;
            
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // 4. Оновлення текстового профілю (Виправлено помилку showStats)
    updateProfile(id, data) {
        return new Promise((resolve, reject) => {
            // 👇 1. ОГОЛОШУЄМО ЗМІННУ ТУТ
            // Конвертуємо true/false/"true" в 1 або 0 для SQLite
            const showStats = (data.show_stats_public === true || data.show_stats_public === 1 || data.show_stats_public === 'true') ? 1 : 0;

            const sql = `
                UPDATE users 
                SET 
                    nickname = ?, 
                    bio = ?, 
                    location = ?, 
                    contact_email = ?,
                    social_telegram = ?,
                    social_instagram = ?, 
                    social_twitter = ?,
                    social_artstation = ?, 
                    social_behance = ?,
                    social_website = ?,
                    show_stats_public = ?  -- Оновлюємо налаштування
                WHERE id = ?
            `;
            
            const params = [
                data.nickname, 
                data.bio, 
                data.location,
                data.contact_email,
                data.social_telegram,
                data.social_instagram,
                data.social_twitter,
                data.social_artstation,
                data.social_behance,
                data.social_website,
                showStats, // 👇 ТЕПЕР ВОНА ІСНУЄ
                id
            ];

            db.run(sql, params, function(err) {
                if (err) return reject(err);
                
                // Після успішного оновлення повертаємо оновлений профіль
                // Щоб фронтенд одразу оновив картинку і дані
                const selectSql = `
                    SELECT 
                        id, nickname, email, avatar_url, bio, location,
                        contact_email, social_telegram, social_instagram, social_twitter, 
                        social_artstation, social_behance, social_website,
                        show_stats_public
                    FROM users WHERE id = ?
                `;

                db.get(selectSql, [id], (err, row) => {
                    if(err) reject(err);
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
}

module.exports = new UserDAO();