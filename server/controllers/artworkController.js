const artworkService = require('../services/artworkService');
const { validate } = require('../utils/validation'); // 👇 Імпорт

class ArtworkController {

    // POST /api/artworks
    async create(req, res) {
        try {
            // 👇 Перевірка
            const errors = validate.artwork(req.body);
            if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

            const userId = req.user.id;
            const image_path = req.file ? 'uploads/' + req.file.filename : null;

            // Парсинг ID (тільки цифри)
            const parseIds = (str) => {
                if (!str) return [];
                return String(str).split(',').map(num => Number(num.trim())).filter(n => !isNaN(n) && n > 0);
            };

            const artworkData = {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status,
                style_id: req.body.style_id ? Number(req.body.style_id) : null,
                genre_id: req.body.genre_id ? Number(req.body.genre_id) : null,
                material_ids: parseIds(req.body.material_ids),
                tag_ids: parseIds(req.body.tag_ids),
                image_path: image_path,
                started_year: req.body.started_year || null,
                started_month: req.body.started_month || null,
                started_day: req.body.started_day || null,
                finished_year: req.body.finished_year || null,
                finished_month: req.body.finished_month || null,
                finished_day: req.body.finished_day || null,
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
        // 👇 Перевірка
        const errors = validate.artwork(req.body);
        if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

        const userId = req.user.id;
        const artworkId = req.params.id;
        
        // 1. Дивимось, чи завантажили НОВИЙ файл
        const file_path = req.file ? 'uploads/' + req.file.filename : undefined;
        
        // 2. Дивимось, чи передали шлях до ВЖЕ ІСНУЮЧОГО файлу (рядок)
        const body_image_path = req.body.image_path; 

        const parseIds = (str) => {
            if (str === undefined) return undefined;
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
            started_year: req.body.started_year || null,
            started_month: req.body.started_month || null,
            started_day: req.body.started_day || null,
            finished_year: req.body.finished_year || null,
            finished_month: req.body.finished_month || null,
            finished_day: req.body.finished_day || null,
        };

        // ЛОГІКА ЗМІНИ ОБКЛАДИНКИ:
        if (file_path) {
            // Якщо завантажили файл - він головний
            updateData.image_path = file_path;
        } else if (body_image_path) {
            // Якщо файлу немає, але є рядок (з галереї) - ставимо його
            updateData.image_path = body_image_path;
        }

        const result = await artworkService.updateArtwork(artworkId, userId, updateData);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}

    // GET /api/artworks (Фільтри)
   // GET /api/artworks
   async getAll(req, res) {
    try {
        const userId = req.user.id;
        
        const parseStringArray = (input) => { /* ... (твій код) ... */ if (!input) return []; if (Array.isArray(input)) return input; return input.split(','); };
        const parseNumberArray = (input) => { /* ... (твій код) ... */ if (!input) return []; if (Array.isArray(input)) return input.map(Number); return input.split(',').map(Number).filter(n => !isNaN(n)); };

        const filters = {
            status: req.query.status ? parseStringArray(req.query.status) : [],
            genre_ids: req.query.genre_ids ? parseNumberArray(req.query.genre_ids) : [],
            style_ids: req.query.style_ids ? parseNumberArray(req.query.style_ids) : [],
            material_ids: req.query.material_ids ? parseNumberArray(req.query.material_ids) : [],
            tag_ids: req.query.tag_ids ? parseNumberArray(req.query.tag_ids) : [],
            yearFrom: req.query.yearFrom || null,
            yearTo: req.query.yearTo || null
        };

        // 👇 ОТРИМУЄМО ПАРАМЕТРИ СОРТУВАННЯ
        const sort = {
            by: req.query.sortBy || 'updated', // За замовчуванням "Останні оновлення"
            dir: req.query.sortDir || 'DESC'
        };

        // Передаємо filters та sort у сервіс
        const projects = await artworkService.getAll(userId, filters, sort);
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ message: 'Не вдалося завантажити проєкти.' });
    }
}

    async getOne(req, res) {
        try {
            const artworkId = req.params.id;
            const artwork = await artworkService.getArtworkById(artworkId);
            res.json(artwork);
        } catch (e) {
            res.status(404).json({ message: 'Роботу не знайдено' });
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

    async updateStatus(req, res) {
        try {
            const { status, finished_year, finished_month, finished_day } = req.body;
            const userId = req.user.id;
            const artworkId = req.params.id;
            
            let finishedData = null;
            if (finished_year !== undefined) {
                finishedData = { 
                    year: finished_year, 
                    month: finished_month, 
                    day: finished_day 
                };
            }

            const result = await artworkService.updateStatus(artworkId, userId, status, finishedData);
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message });
        }
    }

    async uploadGalleryImage(req, res) {
        try {
            const artworkId = req.params.id;
            const image_path = req.file ? 'uploads/' + req.file.filename : null;
            const { description } = req.body;

            if (!image_path) {
                return res.status(400).json({ message: 'Файл не завантажено' });
            }

            // Тут бажано викликати сервіс, але для скорочення можна напряму (або додай метод в Service)
            // Припустимо, ми додали метод addGalleryImage в artworkService
            const result = await artworkService.addGalleryImage(artworkId, image_path, description);
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message });
        }
    }

    async deleteGalleryImage(req, res) {
        try {
            const imageId = req.params.imgId;
            const userId = req.user.id;
            await artworkService.removeGalleryImage(imageId, userId);
            res.json({ message: 'Фото успішно видалено' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new ArtworkController();