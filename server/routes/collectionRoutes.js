const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload'); // 👈 ДОДАЙ ЦЕЙ РЯДОК!

router.post('/', authMiddleware, collectionController.create);
router.get('/', authMiddleware, collectionController.getAll);
router.delete('/:id', authMiddleware, collectionController.delete);

// 👇 НОВІ РОУТИ
router.get('/:id', authMiddleware, collectionController.getOne);
router.post('/:id/items', authMiddleware, collectionController.addItem); 
router.delete('/:id/items/:artId', authMiddleware, collectionController.removeItem);

// Batch update & Cover
router.put('/:id/batch', authMiddleware, collectionController.updateBatch);
router.post('/:id/cover', authMiddleware, upload.single('image'), collectionController.uploadCover); // Тепер upload буде знайдено
router.delete('/:id/cover', authMiddleware, collectionController.deleteCover);

// Get collections by artwork
router.get('/artwork/:id', authMiddleware, collectionController.getByArtwork);

module.exports = router;