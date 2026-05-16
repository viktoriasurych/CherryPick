const Router = require('express');
const router = new Router();
const artworkController = require('../controllers/artworkController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

const optimizeImage = require('../middleware/optimizeImage'); 
    
router.post('/', authMiddleware, upload.single('image'), optimizeImage, artworkController.create);
router.get('/', authMiddleware, artworkController.getAll);
router.put('/:id', authMiddleware, upload.single('image'), optimizeImage, artworkController.update);
router.delete('/:id', authMiddleware, artworkController.delete);
router.get('/:id', authMiddleware, artworkController.getOne); 
router.patch('/:id/status', authMiddleware, artworkController.updateStatus);
router.post('/:id/gallery', authMiddleware, upload.single('image'), optimizeImage, artworkController.uploadGalleryImage);
router.delete('/gallery/:imgId', authMiddleware, artworkController.deleteGalleryImage);

module.exports = router;