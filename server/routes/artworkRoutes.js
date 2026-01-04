const Router = require('express');
const router = new Router();
const artworkController = require('../controllers/artworkController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.post('/', authMiddleware, upload.single('image'), artworkController.create);
router.get('/', authMiddleware, artworkController.getAll);
router.put('/:id', authMiddleware, upload.single('image'), artworkController.update);
router.delete('/:id', authMiddleware, artworkController.delete);
router.get('/:id', authMiddleware, artworkController.getOne); 
router.patch('/:id/status', authMiddleware, artworkController.updateStatus);
router.post('/:id/gallery', authMiddleware, upload.single('image'), artworkController.uploadGalleryImage);
router.delete('/gallery/:imgId', authMiddleware, artworkController.deleteGalleryImage);

module.exports = router;