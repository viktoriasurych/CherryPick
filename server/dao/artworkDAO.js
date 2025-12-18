const db = require('../config/db');

class ArtworkDAO {

    create(userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO artworks (
                title, description, image_path, status, user_id, style_id, genre_id, 
                started_year, started_month, started_day,
                finished_year, finished_month, finished_day
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [
                data.title, data.description, data.image_path, data.status || 'PLANNED', userId, 
                data.style_id, data.genre_id, 
                data.started_year, data.started_month, data.started_day,
                data.finished_year, data.finished_month, data.finished_day
            ], function(err) {
                if (err) return reject(err);
                
                const artworkId = this.lastID;

                const addLinks = (table, field, ids) => {
                    if (!ids || !Array.isArray(ids) || ids.length === 0) return;
                    const placeholder = ids.map(() => '(?, ?)').join(',');
                    const values = [];
                    ids.forEach(id => { values.push(artworkId, id); });

                    db.run(`INSERT INTO ${table} (artwork_id, ${field}) VALUES ${placeholder}`, values, (err) => {
                        if(err) console.error(`Помилка вставки в ${table}:`, err);
                    });
                };

                addLinks('artwork_materials_link', 'material_id', data.material_ids);
                addLinks('artwork_tags_link', 'tag_id', data.tag_ids);
                
                resolve({ id: this.lastID, ...data });
            });
        });
    }

    getAll(userId, filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    a.*,
                    s.name as style_name,
                    g.name as genre_name
                FROM artworks a
                LEFT JOIN art_styles s ON a.style_id = s.id
                LEFT JOIN art_genres g ON a.genre_id = g.id
                WHERE a.user_id = ?
            `;
            
            const params = [userId];

            // --- ФІЛЬТРИ ---
            if (filters.status && filters.status.length > 0) {
                const placeholders = filters.status.map(() => '?').join(',');
                sql += ` AND a.status IN (${placeholders})`;
                params.push(...filters.status);
            }
            if (filters.genre_ids && filters.genre_ids.length > 0) {
                const placeholders = filters.genre_ids.map(() => '?').join(',');
                sql += ` AND a.genre_id IN (${placeholders})`;
                params.push(...filters.genre_ids);
            }
            if (filters.style_ids && filters.style_ids.length > 0) {
                const placeholders = filters.style_ids.map(() => '?').join(',');
                sql += ` AND a.style_id IN (${placeholders})`;
                params.push(...filters.style_ids);
            }
            if (filters.material_ids && filters.material_ids.length > 0) {
                const placeholders = filters.material_ids.map(() => '?').join(',');
                sql += ` AND a.id IN (SELECT artwork_id FROM artwork_materials_link WHERE material_id IN (${placeholders}))`;
                params.push(...filters.material_ids);
            }
            if (filters.tag_ids && filters.tag_ids.length > 0) {
                const placeholders = filters.tag_ids.map(() => '?').join(',');
                sql += ` AND a.id IN (SELECT artwork_id FROM artwork_tags_link WHERE tag_id IN (${placeholders}))`;
                params.push(...filters.tag_ids);
            }
            if (filters.yearFrom) {
                sql += ` AND a.finished_year >= ?`;
                params.push(filters.yearFrom);
            }
            if (filters.yearTo) {
                sql += ` AND a.finished_year <= ?`;
                params.push(filters.yearTo);
            }

            sql += ` ORDER BY a.created_date DESC`;

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // 👇 ОНОВЛЕНИЙ findById: Тепер завантажує і Галерею
    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT a.*, s.name as style_name, g.name as genre_name,
                    (SELECT GROUP_CONCAT(material_id) FROM artwork_materials_link WHERE artwork_id = a.id) as material_ids,
                    (SELECT GROUP_CONCAT(am.name, ', ') FROM artwork_materials_link link JOIN art_materials am ON link.material_id = am.id WHERE link.artwork_id = a.id) as material_names,
                    (SELECT GROUP_CONCAT(tag_id) FROM artwork_tags_link WHERE artwork_id = a.id) as tag_ids,
                    (SELECT GROUP_CONCAT(at.name, ', ') FROM artwork_tags_link link2 JOIN art_tags at ON link2.tag_id = at.id WHERE link2.artwork_id = a.id) as tag_names
                FROM artworks a
                LEFT JOIN art_styles s ON a.style_id = s.id
                LEFT JOIN art_genres g ON a.genre_id = g.id
                WHERE a.id = ?
            `;
            
            db.get(sql, [id], (err, artwork) => {
                if (err) return reject(err);
                if (!artwork) return resolve(null);

                // Перетворення ID масивів
                artwork.material_ids = artwork.material_ids ? artwork.material_ids.toString().split(',').map(Number) : [];
                artwork.tag_ids = artwork.tag_ids ? artwork.tag_ids.toString().split(',').map(Number) : [];

                // 👇 ДОДАТКОВИЙ ЗАПИТ: Отримати фото галереї
                db.all(`SELECT * FROM artwork_gallery WHERE artwork_id = ? ORDER BY id DESC`, [id], (err, gallery) => {
                    if (err) return reject(err);
                    artwork.gallery = gallery || []; // Додаємо поле gallery до об'єкта
                    resolve(artwork);
                });
            });
        });
    }

    // 👇 МЕТОДИ ДЛЯ ГАЛЕРЕЇ (НОВІ)

    addGalleryImage(artworkId, imagePath, description = '') {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO artwork_gallery (artwork_id, image_path, description) VALUES (?, ?, ?)`;
            db.run(sql, [artworkId, imagePath, description], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, image_path: imagePath, description });
            });
        });
    }

    getGalleryImageById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM artwork_gallery WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    deleteGalleryImage(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM artwork_gallery WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // 👇 ПЕРЕВІРКА ДУБЛІКАТІВ (Щоб не зберігати одну фотку двічі)
    checkGalleryImageExists(artworkId, imagePath) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id FROM artwork_gallery WHERE artwork_id = ? AND image_path = ?`;
            db.get(sql, [artworkId, imagePath], (err, row) => {
                if (err) reject(err);
                else resolve(!!row); // true, якщо знайшли
            });
        });
    }

    // -----------------------------------------------------

    update(id, userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE artworks SET 
                title=?, description=?, style_id=?, genre_id=?, status=?,
                started_year=?, started_month=?, started_day=?,
                finished_year=?, finished_month=?, finished_day=?
                WHERE id=? AND user_id=?`;
            
            db.run(sql, [
                data.title, data.description, data.style_id, data.genre_id, data.status,
                data.started_year, data.started_month, data.started_day,
                data.finished_year, data.finished_month, data.finished_day,
                id, userId
            ], function(err) {
                if (err) return reject(err);

                if (data.image_path) {
                    db.run(`UPDATE artworks SET image_path=? WHERE id=?`, [data.image_path, id]);
                }

                if (data.material_ids !== undefined) {
                    db.run(`DELETE FROM artwork_materials_link WHERE artwork_id=?`, [id], () => {
                        const ids = Array.isArray(data.material_ids) ? data.material_ids : String(data.material_ids).split(',').filter(Boolean);
                        if (ids.length) {
                             const placeholder = ids.map(() => '(?, ?)').join(',');
                             const values = [];
                             ids.forEach(matId => values.push(id, matId));
                             db.run(`INSERT INTO artwork_materials_link (artwork_id, material_id) VALUES ${placeholder}`, values);
                        }
                    });
                }

                if (data.tag_ids !== undefined) {
                    db.run(`DELETE FROM artwork_tags_link WHERE artwork_id=?`, [id], () => {
                         const ids = Array.isArray(data.tag_ids) ? data.tag_ids : String(data.tag_ids).split(',').filter(Boolean);
                         if (ids.length) {
                             const placeholder = ids.map(() => '(?, ?)').join(',');
                             const values = [];
                             ids.forEach(tagId => values.push(id, tagId));
                             db.run(`INSERT INTO artwork_tags_link (artwork_id, tag_id) VALUES ${placeholder}`, values);
                        }
                    });
                }
                resolve({ id, ...data });
            });
        });
    }

    delete(id, userId) {
         return new Promise((resolve, reject) => {
            const sql = `DELETE FROM artworks WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) reject(err);
                else resolve({ message: 'Deleted', changes: this.changes });
            });
        });
    }

    updateStatus(id, userId, status, finishedData = null) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE artworks SET status = ? WHERE id = ? AND user_id = ?`;
            let params = [status, id, userId];

            if (finishedData) {
                sql = `UPDATE artworks SET 
                    status = ?, 
                    finished_year = ?, finished_month = ?, finished_day = ? 
                    WHERE id = ? AND user_id = ?`;
                params = [status, finishedData.year || null, finishedData.month || null, finishedData.day || null, id, userId];
            }

            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    }
}

module.exports = new ArtworkDAO();