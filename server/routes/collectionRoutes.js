const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware'); 
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware'); 
const upload = require('../middleware/fileUpload');

// Публічні колекції
router.get('/public', collectionController.getPublic);

router.get('/saved', authMiddleware, collectionController.getSaved);
router.get('/artwork/:id', authMiddleware, collectionController.getByArtwork);
router.get('/', authMiddleware, collectionController.getAll);
router.post('/', authMiddleware, collectionController.create);
router.put('/reorder', authMiddleware, collectionController.reorder);

router.post('/:id/save', authMiddleware, collectionController.save);
router.delete('/:id/save', authMiddleware, collectionController.unsave);
router.post('/:id/items', authMiddleware, collectionController.addItem);
router.delete('/:id/items/:artId', authMiddleware, collectionController.removeItem);
router.put('/:id/batch', authMiddleware, collectionController.updateBatch);
router.post('/:id/cover', authMiddleware, upload.single('image'), collectionController.uploadCover);
router.delete('/:id/cover', authMiddleware, collectionController.deleteCover);
router.delete('/:id', authMiddleware, collectionController.delete);
router.put('/:id', authMiddleware, collectionController.update);
router.get('/:id', optionalAuthMiddleware, collectionController.getOne);

module.exports = router;