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


// 🔐 Отримати список ID колекцій для конкретної картини 
router.get('/artwork/:id', authMiddleware, collectionController.getByArtwork);

// 🔐 Отримати ВСІ свої колекції
router.get('/', authMiddleware, collectionController.getAll);

// 🔐 Створити нову
router.post('/', authMiddleware, collectionController.create);

// 🔐 Змінити порядок
router.put('/reorder', authMiddleware, collectionController.reorder);


// ============================================
// 2. МАРШРУТИ З ПАРАМЕТРОМ :id (Dynamic)
// ============================================

// 🔐 Робота з елементами
router.post('/:id/items', authMiddleware, collectionController.addItem);
router.delete('/:id/items/:artId', authMiddleware, collectionController.removeItem);

// 🔐 Batch update & Cover
router.put('/:id/batch', authMiddleware, collectionController.updateBatch);
router.post('/:id/cover', authMiddleware, upload.single('image'), collectionController.uploadCover);
router.delete('/:id/cover', authMiddleware, collectionController.deleteCover);

// 🔐 Видалення / Редагування
router.delete('/:id', authMiddleware, collectionController.delete);
router.put('/:id', authMiddleware, collectionController.update);

// 👇 ВАЖЛИВО: Цей маршрут ловить ВСЕ, що схоже на ID. 
// Тому він має бути ОСТАННІМ серед GET запитів.
router.get('/:id', optionalAuthMiddleware, collectionController.getOne);

module.exports = router;