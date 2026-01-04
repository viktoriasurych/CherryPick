const jwt = require('jsonwebtoken');
const collectionService = require('../services/collectionService');
const viewStatsService = require('../services/viewStatsService');
const { validate } = require('../utils/validation');

const secret = process.env.JWT_SECRET || 'fallback_secret';

class CollectionController {
    
    async create(req, res) {
        try {
            const errors = validate.collection(req.body);
            if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

            const userId = req.user.id;
            const { title, description, type, is_public } = req.body; 
            
            if (!['MOODBOARD', 'SERIES', 'EXHIBITION'].includes(type)) {
                return res.status(400).json({ message: "Невірний тип колекції" });
            }
            
            const newCollection = await collectionService.createCollection(userId, { 
                title, description, type, is_public 
            });
            res.status(201).json(newCollection);
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }

    async getPublic(req, res) {
        try {
            const userId = req.query.userId || req.user.id; 
            
            const collections = await collectionService.getPublicCollections(userId);
            res.json(collections);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const collections = await collectionService.getUserCollections(userId);
            res.json(collections);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message });
        }
    }

    async delete(req, res) {
        try {
            const userId = req.user.id;
            const collectionId = req.params.id;
            await collectionService.deleteCollection(collectionId, userId);
            res.json({ message: "Колекцію видалено" });
        } catch (e) {
            console.error(e);
            if (e.message.includes('не знайдено')) {
                res.status(404).json({ message: e.message });
            } else {
                res.status(500).json({ message: e.message });
            }
        }
    }

    async addItem(req, res) {
        try {
            const userId = req.user.id;
            const collectionId = req.params.id;
            const { artworkId } = req.body;
            await collectionService.addItemToCollection(collectionId, artworkId, userId);
            res.json({ message: "Додано" });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async removeItem(req, res) {
        try {
            const userId = req.user.id;
            const { id: collectionId, artId: artworkId } = req.params;
            await collectionService.removeItemFromCollection(collectionId, artworkId, userId);
            res.json({ message: "Видалено" });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getByArtwork(req, res) {
        try {
            const userId = req.user.id;
            const artworkId = req.params.id;
            const ids = await collectionService.getCollectionsByArtwork(artworkId, userId);
            res.json(ids);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getOne(req, res) {
        try {
            const collectionId = req.params.id;
            let userId = null;

            try {
                const authHeader = req.headers.authorization;
                if (authHeader) {
                    const token = authHeader.split(' ')[1];
                    if (token) {
                        const decoded = jwt.verify(token, secret);
                        userId = decoded.id;
                    }
                }
            } catch (e) {
                console.log("Гість переглядає колекцію");
            }

            const collection = await collectionService.getCollectionDetails(collectionId, userId);
            
            if (!collection) {
                return res.status(404).json({ message: "Колекцію не знайдено (або вона приватна)" });
            }

            try {
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                viewStatsService.recordView(collectionId, userId, ip).catch(() => {});
                
                const views = await viewStatsService.getViewsCount(collectionId);
                res.json({ ...collection, views });
            } catch (statErr) {
                res.json({ ...collection, views: 0 });
            }

        } catch (e) {
            console.error("Помилка отримання колекції:", e);
            res.status(500).json({ message: e.message });
        }
    }

    async update(req, res) {
        try {
            const errors = validate.collection(req.body);
            if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

            await collectionService.updateCollection(req.params.id, req.user.id, req.body);
            res.json({ message: "Оновлено" });
        } catch(e) { 
            console.error(e);
            res.status(500).json({message: e.message}); 
        }
    }

    async updateItem(req, res) {
        try {
            await collectionService.updateCollectionItem(req.params.itemId, req.body);
            res.json({ message: "Елемент оновлено" });
        } catch(e) { 
            console.error(e);
            res.status(500).json({message: e.message}); 
        }
    }

    // PUT /api/collections/:id/batch
    async updateBatch(req, res) {
        try {
            const { meta, items } = req.body; // meta = {title, desc}, items = [{id, sort_order...}]
            await collectionService.saveCollectionChanges(req.params.id, req.user.id, meta, items);
            res.json({ message: "Збережено успішно" });
        } catch(e) { res.status(500).json({message: e.message}); }
    }

    // POST /api/collections/:id/cover
    async uploadCover(req, res) {
        try {
            if (!req.file) return res.status(400).json({ message: "Файл не обрано" });
            await collectionService.uploadCover(req.params.id, req.user.id, req.file);
            res.json({ message: "Обкладинку оновлено" });
        } catch(e) { res.status(500).json({message: e.message}); }
    }

    // DELETE /api/collections/:id/cover
    async deleteCover(req, res) {
        try {
            await collectionService.removeCover(req.params.id, req.user.id);
            res.json({ message: "Обкладинку видалено" });
        } catch(e) { res.status(500).json({message: e.message}); }
    }

    async reorder(req, res) {
        try {
            await collectionService.reorderCollections(req.body.items);
            res.json({ message: "Порядок збережено" });
        } catch(e) { res.status(500).json({message: e.message}); }
    }

    // POST /api/collections/:id/save
    async save(req, res) {
        try {
            await collectionService.saveCollection(req.params.id, req.user.id);
            res.json({ message: "Колекцію збережено", is_saved: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    // DELETE /api/collections/:id/save
    async unsave(req, res) {
        try {
            await collectionService.unsaveCollection(req.params.id, req.user.id);
            res.json({ message: "Колекцію видалено зі збережених", is_saved: false });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    // GET /api/collections/saved
    async getSaved(req, res) {
        try {
            const collections = await collectionService.getSavedCollections(req.user.id);
            res.json(collections);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new CollectionController();