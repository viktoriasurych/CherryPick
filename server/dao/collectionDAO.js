const db = require('../config/db');

class CollectionDAO {

    // Створити колекцію
    create(userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO collections (user_id, title, description, type) VALUES (?, ?, ?, ?)`;
            db.run(sql, [userId, data.title, data.description, data.type], function(err) {
                if (err) return reject(err);
                
                // Повертаємо створений об'єкт
                resolve({ 
                    id: this.lastID, 
                    user_id: userId,
                    ...data,
                    item_count: 0 // Нова колекція завжди пуста
                });
            });
        });
    }

   // Оновити цей метод в server/dao/collectionDAO.js
   getAll(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                c.*, 
                COUNT(ci.id) as item_count,
                -- 👇 ПІДЗАПИТ ДЛЯ ОБКЛАДИНКИ (Остання додана картина)
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
            ORDER BY c.created_at DESC
        `;
        
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}
    // Отримати одну колекцію за ID
    getById(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM collections WHERE id = ? AND user_id = ?`;
            db.get(sql, [id, userId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    // Видалити колекцію
    delete(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM collections WHERE id = ? AND user_id = ?`;
            db.run(sql, [id, userId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // ... create, getAll, getById, delete ...

    // 👇 НОВІ МЕТОДИ ДЛЯ ITEMs

    // Додати картину в колекцію
    addItem(collectionId, artworkId) {
        return new Promise((resolve, reject) => {
            // IGNORE, щоб не було помилки, якщо вже додано
            const sql = `INSERT OR IGNORE INTO collection_items (collection_id, artwork_id) VALUES (?, ?)`;
            db.run(sql, [collectionId, artworkId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Видалити картину з колекції
    removeItem(collectionId, artworkId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM collection_items WHERE collection_id = ? AND artwork_id = ?`;
            db.run(sql, [collectionId, artworkId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Отримати список ID колекцій, в яких є конкретна картина (для галочок в модалці)
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
                // Повертаємо просто масив ID: [1, 5, 12]
                resolve(rows.map(row => row.id));
            });
        });
    }

    // Отримати всі картини конкретної колекції (для сторінки перегляду)
    getCollectionItems(collectionId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ci.id as link_id,  -- 👈 ОСЬ ЦЕ МИ ДОДАЛИ! (ID зв'язку)
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
    // Оновити налаштування конкретної картини в колекції (опис, тип, порядок)
    updateItem(itemId, data) {
        return new Promise((resolve, reject) => {
            // Будуємо динамічний запит
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

            params.push(itemId); // ID запису в collection_items, не artwork_id

            const sql = `UPDATE collection_items SET ${fields.join(', ')} WHERE id = ?`;
            
            db.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }
    
    // Оновити саму колекцію
    update(id, userId, data) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE collections SET title = ?, description = ? WHERE id = ? AND user_id = ?`;
            db.run(sql, [data.title, data.description, id, userId], function(err) {
                if(err) return reject(err);
                resolve({changes: this.changes});
            });
        });
    }

    // Оновити колекцію + всі її елементи за один раз (Batch Update)
    async updateBatch(collectionId, userId, metaData, itemsData) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 1. Оновлюємо метадані (назву, опис)
                const sqlMeta = `UPDATE collections SET title = ?, description = ? WHERE id = ? AND user_id = ?`;
                db.run(sqlMeta, [metaData.title, metaData.description, collectionId, userId]);

                // 2. Оновлюємо кожен елемент (порядок, тип, опис)
                const sqlItem = `UPDATE collection_items SET sort_order = ?, layout_type = ?, context_description = ? WHERE id = ?`;
                const stmt = db.prepare(sqlItem);

                itemsData.forEach(item => {
                    // item.id тут - це link_id (зв'язок)
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

    // Оновити шлях до обкладинки
    updateCover(id, userId, imagePath) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE collections SET cover_image = ? WHERE id = ? AND user_id = ?`;
            db.run(sql, [imagePath, id, userId], function(err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = new CollectionDAO();