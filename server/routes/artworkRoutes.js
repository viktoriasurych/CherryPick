// server/routes/artworkRoutes.js
const Router = require('express');
const router = new Router();
const artworkController = require('../controllers/artworkController');
const authMiddleware = require('../middleware/authMiddleware'); // Твій захист
const upload = require('../middleware/fileUpload'); // Твоє завантаження фото

// 1. Створити проект (Потрібен Токен + Фото)
// upload.single('image') означає, що ми чекаємо файл у полі з назвою "image"
router.post('/', authMiddleware, upload.single('image'), artworkController.create);

// 2. Отримати всі проекти (Тільки Токен)
router.get('/', authMiddleware, artworkController.getAll);

// 3. Редагувати (Токен + Можливо нове фото)
router.put('/:id', authMiddleware, upload.single('image'), artworkController.update);

// 4. Видалити (Тільки Токен)
router.delete('/:id', authMiddleware, artworkController.delete);

// 👇 ДОДАЙ ЦЕЙ НОВИЙ РОУТ 👇
router.get('/:id', authMiddleware, artworkController.getOne); 

// ...
router.patch('/:id/status', authMiddleware, artworkController.updateStatus); // <--- НОВЕ
// ...

// 👇 НОВИЙ РОУТ ДЛЯ ГАЛЕРЕЇ
router.post('/:id/gallery', authMiddleware, upload.single('image'), artworkController.uploadGalleryImage);

// ...
// 👇 Новий маршрут для видалення однієї фотки з галереї
router.delete('/gallery/:imgId', authMiddleware, artworkController.deleteGalleryImage);

module.exports = router;