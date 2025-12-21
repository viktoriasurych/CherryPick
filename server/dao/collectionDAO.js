const db = require('../config/db');

class CollectionDAO {

    // 1. Створити
    create(userId, data) {
        return new Promise((resolve, reject) => {
            // Конвертуємо в 1 або 0
            const isPublic = data.is_public ? 1 : 0;

            const sql = `INSERT INTO collections (user_id, title, description, type, is_public) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [userId, data.title, data.description, data.type, isPublic], function(err) {
                if (err) return reject(err);
                resolve({ 
                    id: this.lastID, 
                    user_id: userId,
                    ...data,
                    is_public: isPublic,
                    item_count: 0
                });
            });
        });
    }

    // 2. Оновити (окремий метод)
    update(id, userId, data) {
        return new Promise((resolve, reject) => {
            const isPublic = data.is_public ? 1 : 0;
            
            // 👇 ДОДАЛИ is_public = ?
            const sql = `UPDATE collections SET title = ?, description = ?, is_public = ? WHERE id = ? AND user_id = ?`;
            db.run(sql, [data.title, data.description, isPublic, id, userId], function(err) {
                if(err) return reject(err);
                resolve({changes: this.changes});
            });
        });
    }

    // 3. Batch Update (Збереження всього з редактора)
    async updateBatch(collectionId, userId, metaData, itemsData) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 👇 ТУТ БУЛА ПОМИЛКА. ДОДАЄМО is_public
                const isPublic = metaData.is_public ? 1 : 0;
                
                const sqlMeta = `UPDATE collections SET title = ?, description = ?, is_public = ? WHERE id = ? AND user_id = ?`;
                
                // Передаємо isPublic у масив параметрів
                db.run(sqlMeta, [metaData.title, metaData.description, isPublic, collectionId, userId], function(err) {
                    if (err) {
                        console.error("Помилка оновлення метаданих:", err);
                        // Продовжуємо, але транзакція може бути пошкоджена.
                        // В ідеалі тут треба rollback, але в serialize це складно.
                    }
                });

                // 2. Оновлюємо елементи (залишається без змін)
                const sqlItem = `UPDATE collection_items SET sort_order = ?, layout_type = ?, context_description = ? WHERE id = ?`;
                const stmt = db.prepare(sqlItem);

                itemsData.forEach(item => {
                    stmt.run(item.sort_order, item.layout_type, item.context_description, item.id);
                });

                stmt.finalize();

                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve({ success: true });
                });
            });
        });
    }

    // Отримати ТІЛЬКИ публічні колекції (для профілю)
    getPublic(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.*, 
                    COUNT(ci.id) as item_count,
                    (
                        SELECT a.image_path 
                        FROM collection_items ci_sub
                        JOIN artworks a ON ci_sub.artwork_id = a.id
                        WHERE ci_sub.collection_id = c.id
                        ORDER BY ci_sub.created_at DESC
                        LIMIT 1
                    ) as latest_image
                FROM collections c 
                LEFT JOIN collection_items ci ON c.id = ci.collection_id 
                WHERE c.user_id = ? AND c.is_public = 1 
                GROUP BY c.id 
                ORDER BY c.created_at DESC
            `;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getAll(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.*, 
                    COUNT(ci.id) as item_count,
                    (
                        SELECT a.image_path 
                        FROM collection_items ci_sub
                        JOIN artworks a ON ci_sub.artwork_id = a.id
                        WHERE ci_sub.collection_id = c.id
                        ORDER BY ci_sub.created_at DESC
                        LIMIT 1
                    ) as latest_image
                FROM collections c 
                LEFT JOIN collection_items ci ON c.id = ci.collection_id 
                WHERE c.user_id = ? 
                GROUP BY c.id 
                ORDER BY c.sort_order ASC, c.created_at DESC -- 👈 ОСЬ ТУТ КЛЮЧОВА ЗМІНА
            `;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

   // 👇 ОНОВЛЕНИЙ МЕТОД getById
   getById(id, currentUserId = null) {
    return new Promise((resolve, reject) => {
        // Формуємо запит динамічно
        // 1. Якщо є юзер -> перевіряємо чи ВІН зберіг (is_saved)
        // 2. Рахуємо ЗАГАЛЬНУ кількість збережень (save_count)
        let sql = `
            SELECT 
                c.*, 
                u.nickname as author_name, 
                u.avatar_url as author_avatar,
                u.id as author_id,
                -- 👇 ПІДРАХУНОК ВСІХ ЗБЕРЕЖЕНЬ
                (SELECT COUNT(*) FROM saved_collections WHERE collection_id = c.id) as save_count
                
                ${currentUserId ? `, (SELECT 1 FROM saved_collections WHERE user_id = ? AND collection_id = c.id) as is_saved` : ''}
            FROM collections c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
        
        // Якщо є currentUserId, то параметри: [userId, collectionId]
        // Якщо немає (гість), то параметри: [collectionId]
        const params = currentUserId ? [currentUserId, id] : [id];

        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            if (row) {
                // Конвертуємо 1/0 в true/false
                row.is_saved = !!row.is_saved;
            }
            resolve(row);
        });
    });
}

    // Видалити
    delete(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM collections WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Додати елемент
    addItem(collectionId, artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR IGNORE INTO collection_items (collection_id, artwork_id) VALUES (?, ?)`;
            db.run(sql, [collectionId, artworkId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Видалити елемент
    removeItem(collectionId, artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM collection_items WHERE collection_id = ? AND artwork_id = ?`;
            db.run(sql, [collectionId, artworkId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Отримати список ID колекцій для картини
    getCollectionsByArtwork(artworkId, userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c.id 
                FROM collections c
                JOIN collection_items ci ON c.id = ci.collection_id
                WHERE ci.artwork_id = ? AND c.user_id = ?
            `;
            db.all(sql, [artworkId, userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(row => row.id));
            });
        });
    }

    // Отримати елементи колекції
    getCollectionItems(collectionId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ci.id as link_id,
                    a.*, 
                    ci.sort_order,
                    ci.layout_type,
                    ci.context_description
                FROM collection_items ci
                JOIN artworks a ON ci.artwork_id = a.id
                WHERE ci.collection_id = ?
                ORDER BY ci.sort_order ASC, ci.created_at DESC
            `;
            db.all(sql, [collectionId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // Оновити елемент
    updateItem(itemId, data) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const params = [];

            if (data.context_description !== undefined) {
                fields.push('context_description = ?');
                params.push(data.context_description);
            }
            if (data.layout_type !== undefined) {
                fields.push('layout_type = ?');
                params.push(data.layout_type);
            }
            if (data.sort_order !== undefined) {
                fields.push('sort_order = ?');
                params.push(data.sort_order);
            }

            if (fields.length === 0) return resolve({ changes: 0 });

            params.push(itemId);
            const sql = `UPDATE collection_items SET ${fields.join(', ')} WHERE id = ?`;
            
            db.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Оновити обкладинку
    updateCover(id, userId, imagePath) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE collections SET cover_image = ? WHERE id = ? AND user_id = ?`;
            db.run(sql, [imagePath, id, userId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    getPublic(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.*, 
                    COUNT(ci.id) as item_count,
                    (
                        SELECT a.image_path 
                        FROM collection_items ci_sub
                        JOIN artworks a ON ci_sub.artwork_id = a.id
                        WHERE ci_sub.collection_id = c.id
                        ORDER BY ci_sub.created_at DESC
                        LIMIT 1
                    ) as latest_image
                FROM collections c 
                LEFT JOIN collection_items ci ON c.id = ci.collection_id 
                WHERE c.user_id = ? AND c.is_public = 1 
                GROUP BY c.id 
                ORDER BY c.sort_order ASC, c.created_at DESC -- 👈 І ТУТ ТЕЖ
            `;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // 👇 3. РЕАЛІЗУЄМО ЗБЕРЕЖЕННЯ ПОРЯДКУ
    updateCollectionsOrder(items) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                const sql = 'UPDATE collections SET sort_order = ? WHERE id = ?';
                const stmt = db.prepare(sql);

                // items - це масив [{id: 1}, {id: 5}, ...], який приходить у новому порядку
                items.forEach((item, index) => {
                    // index стає новим sort_order (0, 1, 2...)
                    stmt.run(index, item.id);
                });

                stmt.finalize();

                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error("Помилка збереження порядку:", err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    }

    searchCollections(query) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.id, 
                    c.title, 
                    c.type, 
                    u.nickname as author,
                    (SELECT COUNT(*) FROM collection_items WHERE collection_id = c.id) as item_count
                FROM collections c
                JOIN users u ON c.user_id = u.id
                WHERE c.is_public = 1              -- 👈 ОСЬ ТУТ: Тільки публічні!
                  AND c.title LIKE ?               -- Пошук за назвою
                LIMIT 5                            -- Обмеження, щоб не перевантажувати список
            `;
            db.all(sql, [`%${query}%`], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    save(userId, collectionId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR IGNORE INTO saved_collections (user_id, collection_id) VALUES (?, ?)`;
            db.run(sql, [userId, collectionId], function(err) {
                if (err) return reject(err);
                resolve({ success: true });
            });
        });
    }

    // Прибрати зі збережених
    unsave(userId, collectionId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM saved_collections WHERE user_id = ? AND collection_id = ?`;
            db.run(sql, [userId, collectionId], function(err) {
                if (err) return reject(err);
                resolve({ success: true });
            });
        });
    }

    // Отримати список збережених (Для сторінки "Збережене")
    getSaved(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.*, 
                    u.nickname as author_name,
                    u.avatar_url as author_avatar,
                    sc.saved_at,
                    COUNT(ci.id) as item_count,
                    (
                        SELECT a.image_path 
                        FROM collection_items ci_sub
                        JOIN artworks a ON ci_sub.artwork_id = a.id
                        WHERE ci_sub.collection_id = c.id
                        ORDER BY ci_sub.created_at DESC
                        LIMIT 1
                    ) as latest_image
                FROM saved_collections sc
                JOIN collections c ON sc.collection_id = c.id
                JOIN users u ON c.user_id = u.id
                LEFT JOIN collection_items ci ON c.id = ci.collection_id
                WHERE sc.user_id = ?
                GROUP BY c.id
                ORDER BY sc.saved_at DESC
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    
}

module.exports = new CollectionDAO();