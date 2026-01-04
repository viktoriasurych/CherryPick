const db = require('../config/db');

class UserDAO {
    
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    create(nickname, email, passwordHash, displayName) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (nickname, email, password_hash, display_name) VALUES (?, ?, ?, ?)';
            const nameToSave = displayName || nickname; 
            
            db.run(sql, [nickname, email, passwordHash, nameToSave], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nickname, email, display_name: nameToSave });
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    id, nickname, email, 
                    display_name,
                    avatar_url, bio, location,
                    contact_email, social_telegram, 
                    social_instagram, social_twitter, 
                    social_artstation, social_behance, 
                    social_website,
                    show_global_stats,
                    show_kpi_stats,
                    show_heatmap_stats,
                    created_at 
                FROM users WHERE id = ?`;
            
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                if (row) {
                    row.show_global_stats = !!row.show_global_stats;
                    row.show_kpi_stats = !!row.show_kpi_stats;
                    row.show_heatmap_stats = !!row.show_heatmap_stats;
                }
                resolve(row);
            });
        });
    }

    updateProfile(id, data) {
        return new Promise((resolve, reject) => {
            const showGlobal = data.show_global_stats ? 1 : 0;
            const showKpi = data.show_kpi_stats ? 1 : 0;
            const showHeatmap = data.show_heatmap_stats ? 1 : 0;

            const sql = `
                UPDATE users 
                SET 
                    nickname = ?, 
                    display_name = ?,
                    bio = ?, location = ?, 
                    contact_email = ?, social_telegram = ?,
                    social_instagram = ?, social_twitter = ?,
                    social_artstation = ?, social_behance = ?,
                    social_website = ?,
                    show_global_stats = ?,
                    show_kpi_stats = ?,
                    show_heatmap_stats = ?
                WHERE id = ?
            `;
            
            const params = [
                data.nickname, 
                data.display_name,
                data.bio, data.location,
                data.contact_email, data.social_telegram,
                data.social_instagram, data.social_twitter,
                data.social_artstation, data.social_behance,
                data.social_website,
                showGlobal, showKpi, showHeatmap,
                id
            ];

            db.run(sql, params, function(err) {
                if (err) return reject(err);
                
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

    findByNickname(nickname) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE nickname = ?`, [nickname], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    updateAvatar(id, avatarUrl) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
            db.run(sql, [avatarUrl, id], function(err) {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

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

    findByGoogleId(googleId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE google_id = ?';
            db.get(sql, [googleId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    createFromGoogle(nickname, email, passwordHash, googleId, avatarUrl, displayName) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (nickname, email, password_hash, google_id, avatar_url, display_name) VALUES (?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [nickname, email, passwordHash, googleId, avatarUrl, displayName], function(err) {
                if (err) return reject(err);
                
                resolve({ 
                    id: this.lastID, 
                    nickname, 
                    email, 
                    google_id: googleId, 
                    avatar_url: avatarUrl,
                    display_name: displayName
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