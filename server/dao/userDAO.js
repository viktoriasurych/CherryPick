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

    // 3. Знайти за ID (Повний профіль)
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
                    created_at 
                FROM users WHERE id = ?`;
            
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // 4. Оновлення текстового профілю (Ось цей метод у тебе не знаходило)
    updateProfile(id, data) {
        return new Promise((resolve, reject) => {
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
                    social_website = ?
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
                id
            ];

            db.run(sql, params, function(err) {
                if (err) return reject(err);
                
                // Повертаємо оновлені дані
                db.get(`SELECT id, nickname, email, avatar_url, bio, location, contact_email, social_telegram, social_instagram, social_twitter, social_artstation, social_behance, social_website FROM users WHERE id = ?`, [id], (err, row) => {
                    if(err) reject(err);
                    resolve(row);
                });
            });
        });
    }

    // 5. Оновлення тільки Аватара (І цей теж губився)
    updateAvatar(id, avatarUrl) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
            db.run(sql, [avatarUrl, id], function(err) {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    // 6. Видалення аватара (для кнопки "Видалити фото")
    deleteAvatar(id) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar_url = NULL WHERE id = ?';
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
}

module.exports = new UserDAO();