// server/controllers/artworkController.js
const artworkService = require('../services/artworkService');

class ArtworkController {

    // POST /api/artworks
    async create(req, res) {
        try {
            const userId = req.user.id; 
            // Витягуємо текст з тіла запиту
            const { title, description, status, style_id, material_id } = req.body;

            // 🔥 ГОЛОВНЕ ВИПРАВЛЕННЯ:
            // Перевіряємо, чи є файл. Якщо є — беремо його шлях. Якщо ні — null.
            const image_path = req.file ? 'uploads/' + req.file.filename : null;

            console.log("Завантажений файл:", req.file); // Для перевірки в консолі

            const artwork = await artworkService.createArtwork(userId, {
                title, 
                description, 
                status, 
                image_path, // <--- ПЕРЕДАЄМО ШЛЯХ У СЕРВІС
                style_id, 
                material_id
            });

            res.status(201).json({ 
                message: 'Artwork created successfully.', 
                artwork 
            });

        } catch (error) {
            console.error('Error creating artwork:', error.message);
            res.status(400).json({ message: error.message });
        }
    }

    // ... інші методи (getAll, update, delete) залишай як були
    async getOne(req, res) {
        try {
            const artworkId = req.params.id;
            const artwork = await artworkService.getArtworkById(artworkId);
            res.json(artwork);
        } catch (e) {
            res.status(404).json({ message: 'Роботу не знайдено' });
        }
    }
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const gallery = await artworkService.getUserGallery(userId);
            res.status(200).json(gallery);
        } catch (error) {
            console.error('Error fetching gallery:', error.message);
            res.status(500).json({ message: 'Could not fetch gallery.' });
        }
    }

    async update(req, res) {
        try {
            const userId = req.user.id;
            const artworkId = req.params.id;
            // Тут теж треба ловити файл, якщо ми його оновлюємо
            const image_path = req.file ? 'uploads/' + req.file.filename : undefined; 
            
            const updateData = { ...req.body };
            if (image_path) updateData.image_path = image_path;

            const result = await artworkService.updateArtwork(artworkId, userId, updateData);
            res.json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async delete(req, res) {
        try {
            const userId = req.user.id;
            const artworkId = req.params.id;
            const result = await artworkService.deleteArtwork(artworkId, userId);
            res.json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
}

module.exports = new ArtworkController();