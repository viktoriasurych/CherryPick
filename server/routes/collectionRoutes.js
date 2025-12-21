const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware'); 
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware'); 
const upload = require('../middleware/fileUpload');

// ============================================
// 1. СПОЧАТКУ КОНКРЕТНІ МАРШРУТИ (Specific)
// ============================================

// 🔓 Публічні колекції юзера
router.get('/public', collectionController.getPublic);

// 👇 НОВЕ: Отримати список "Збережених"
// (Має бути ТУТ, перед /:id, інакше сервер подумає, що "saved" це ID)
router.get('/saved', authMiddleware, collectionController.getSaved);

// 🔐 Отримати список ID колекцій для конкретної картини 
router.get('/artwork/:id', authMiddleware, collectionController.getByArtwork);

// 🔐 Отримати ВСІ свої колекції (авторські)
router.get('/', authMiddleware, collectionController.getAll);

// 🔐 Створити нову
router.post('/', authMiddleware, collectionController.create);

// 🔐 Змінити порядок (Drag & Drop)
router.put('/reorder', authMiddleware, collectionController.reorder);


// ============================================
// 2. МАРШРУТИ З ПАРАМЕТРОМ :id (Dynamic)
// ============================================

// 👇 НОВЕ: Збереження / Видалення з закладок
router.post('/:id/save', authMiddleware, collectionController.save);
router.delete('/:id/save', authMiddleware, collectionController.unsave);

// 🔐 Робота з елементами всередині колекції
router.post('/:id/items', authMiddleware, collectionController.addItem);
router.delete('/:id/items/:artId', authMiddleware, collectionController.removeItem);

// 🔐 Batch update & Cover
router.put('/:id/batch', authMiddleware, collectionController.updateBatch);
router.post('/:id/cover', authMiddleware, upload.single('image'), collectionController.uploadCover);
router.delete('/:id/cover', authMiddleware, collectionController.deleteCover);

// 🔐 Видалення / Редагування самої колекції
router.delete('/:id', authMiddleware, collectionController.delete);
router.put('/:id', authMiddleware, collectionController.update);

// 👇 ВАЖЛИВО: Цей маршрут ловить ВСЕ, що схоже на ID. 
// Тому він має бути ОСТАННІМ серед GET запитів.
// Використовуємо optionalAuthMiddleware, щоб показати кнопку "Зберегти" якщо юзер залогінений
router.get('/:id', optionalAuthMiddleware, collectionController.getOne);

module.exports = router;