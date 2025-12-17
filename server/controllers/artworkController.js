// server/controllers/artworkController.js
const artworkService = require('../services/artworkService');

class ArtworkController {

   // POST /api/artworks
   async create(req, res) {
    try {
        const userId = req.user.id;
        
        // 1. Обробка файлу
        const image_path = req.file ? 'uploads/' + req.file.filename : null;

        // 2. Обробка масивів (бо FormData передає їх як стрічки "1,2,3")
        // Якщо прийшло "1,2", робимо [1, 2]. Якщо пусто - [].
        const parseIds = (str) => {
            if (!str) return [];
            return String(str).split(',').map(num => Number(num.trim())).filter(n => !isNaN(n) && n > 0);
        };

        const artworkData = {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            style_id: req.body.style_id ? Number(req.body.style_id) : null,
            genre_id: req.body.genre_id ? Number(req.body.genre_id) : null, // ✅ Жанр
            material_ids: parseIds(req.body.material_ids), // ✅ Масиви
            tag_ids: parseIds(req.body.tag_ids),           // ✅ Масиви
            image_path: image_path
        };

        const artwork = await artworkService.createArtwork(userId, artworkData);
        res.status(201).json({ message: 'Створено успішно', artwork });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

// PUT /api/artworks/:id
async update(req, res) {
    try {
        const userId = req.user.id;
        const artworkId = req.params.id;
        
        // Якщо файлу немає, undefined (щоб не стерти старий)
        const image_path = req.file ? 'uploads/' + req.file.filename : undefined;

        const parseIds = (str) => {
            if (str === undefined) return undefined; // Якщо не передавали - не чіпаємо
            if (!str) return [];
            return String(str).split(',').map(num => Number(num.trim())).filter(n => !isNaN(n) && n > 0);
        };

        const updateData = {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            style_id: req.body.style_id ? Number(req.body.style_id) : null,
            genre_id: req.body.genre_id ? Number(req.body.genre_id) : null,
            material_ids: parseIds(req.body.material_ids),
            tag_ids: parseIds(req.body.tag_ids),
        };

        if (image_path) updateData.image_path = image_path;

        const result = await artworkService.updateArtwork(artworkId, userId, updateData);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
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

    // ... інші методи ...

    // PATCH /api/artworks/:id/status
    async updateStatus(req, res) {
        try {
            const userId = req.user.id;
            const artworkId = req.params.id;
            const { status } = req.body;

            const allowedStatuses = ['PLANNED', 'SKETCH', 'IN_PROGRESS', 'FINISHED', 'ON_HOLD', 'DROPPED'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: "Невірний статус" });
            }

            // Оновлюємо тільки статус (і перевіряємо, чи це картина юзера)
            // Використовуємо сервіс або DAO (тут для швидкості SQL, але краще через сервіс)
            const sql = `UPDATE artworks SET status = ? WHERE id = ? AND user_id = ?`;
            
            // Тут нам треба доступ до db, якщо ми не через сервіс. 
            // Але давай зробимо "як профі" і додамо метод в Service/DAO.
            // Припустимо, ти додаси це в artworkService:
            const result = await artworkService.updateStatus(artworkId, userId, status);
            
            res.json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
}

module.exports = new ArtworkController();