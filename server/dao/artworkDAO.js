// server/dao/artworkDAO.js
const db = require('../config/db');

class ArtworkDAO {

    create(userId, data) {
        return new Promise((resolve, reject) => {
            // ✅ Перевіряємо, чи є genre_id в запиті
            const sql = `INSERT INTO artworks (title, description, image_path, status, user_id, style_id, genre_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [data.title, data.description, data.image_path, data.status || 'PLANNED', userId, data.style_id, data.genre_id], function(err) {
                if (err) return reject(err);
                
                const artworkId = this.lastID;

                // Функція для додавання зв'язків
                const addLinks = (table, field, ids) => {
                    // Якщо ids пустий або не масив - виходимо
                    if (!ids || !Array.isArray(ids) || ids.length === 0) return;
                    
                    const placeholder = ids.map(() => '(?, ?)').join(',');
                    const values = [];
                    ids.forEach(id => { values.push(artworkId, id); });

                    db.run(`INSERT INTO ${table} (artwork_id, ${field}) VALUES ${placeholder}`, values, (err) => {
                        if(err) console.error(`Помилка вставки в ${table}:`, err);
                    });
                };

                // Додаємо матеріали та теги
                addLinks('artwork_materials_link', 'material_id', data.material_ids);
                addLinks('artwork_tags_link', 'tag_id', data.tag_ids);
                
                resolve({ id: artworkId, ...data });
            });
        });
    }

    // Отримати одну (з JOIN-ами для списків)
    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    s.name as style_name,
                    g.name as genre_name,
                    -- Склеюємо назви матеріалів через кому
                    (SELECT GROUP_CONCAT(am.name, ', ') 
                     FROM artwork_materials_link link
                     JOIN art_materials am ON link.material_id = am.id 
                     WHERE link.artwork_id = a.id) as material_names,
                     -- Склеюємо ID матеріалів (для редагування)
                    (SELECT GROUP_CONCAT(material_id) FROM artwork_materials_link WHERE artwork_id = a.id) as material_ids,
                    
                    -- Те саме для тегів
                    (SELECT GROUP_CONCAT(at.name, ', ') 
                     FROM artwork_tags_link link2
                     JOIN art_tags at ON link2.tag_id = at.id 
                     WHERE link2.artwork_id = a.id) as tag_names,
                    (SELECT GROUP_CONCAT(tag_id) FROM artwork_tags_link WHERE artwork_id = a.id) as tag_ids

                FROM artworks a
                LEFT JOIN art_styles s ON a.style_id = s.id
                LEFT JOIN art_genres g ON a.genre_id = g.id
                WHERE a.id = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else {
                    // Перетворюємо стрічки "1,2,3" назад у масиви [1,2,3] для фронтенду
                    if(row) {
                        row.material_ids = row.material_ids ? row.material_ids.toString().split(',').map(Number) : [];
                        row.tag_ids = row.tag_ids ? row.tag_ids.toString().split(',').map(Number) : [];
                    }
                    resolve(row);
                }
            });
        });
    }

    // Оновити (Видаляємо старі зв'язки -> пишемо нові)
    update(id, userId, data) {
        return new Promise((resolve, reject) => {
            // 1. Оновлюємо інфо
            const sql = `UPDATE artworks SET title=?, description=?, style_id=?, genre_id=? WHERE id=? AND user_id=?`;
            db.run(sql, [data.title, data.description, data.style_id, data.genre_id, id, userId], function(err) {
                if (err) return reject(err);
                
                // Якщо є нове фото
                if (data.image_path) {
                    db.run(`UPDATE artworks SET image_path=? WHERE id=?`, [data.image_path, id]);
                }

                // 2. Оновлюємо матеріали (Спочатку чистимо, потім пишемо)
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

                // 3. Оновлюємо теги
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
    
    getAll(userId) {
        return new Promise((resolve, reject) => {
            // Ми просто беремо список картин. 
            // Не обов'язково тягнути всі теги в загальний список, щоб не грузити базу.
            // Тягнемо тільки базові назви стилю і жанру для краси.
            const sql = `
                SELECT 
                    a.*,
                    s.name as style_name,
                    g.name as genre_name
                FROM artworks a
                LEFT JOIN art_styles s ON a.style_id = s.id
                LEFT JOIN art_genres g ON a.genre_id = g.id
                WHERE a.user_id = ? 
                ORDER BY a.created_date DESC
            `;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    
    // ... delete, updateStatus ...
    delete(id, userId) {
         return new Promise((resolve, reject) => {
            const sql = `DELETE FROM artworks WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) reject(err);
                else resolve({ message: 'Deleted', changes: this.changes });
            });
        });
    }
    
     updateStatus(id, userId, status) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE artworks SET status = ? WHERE id = ? AND user_id = ?`;
            db.run(sql, [status, id, userId], function(err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    }
}

module.exports = new ArtworkDAO();