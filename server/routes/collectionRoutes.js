const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.use(authMiddleware); // Захист для всіх роутів

// 1. Спочатку статичні/конкретні роути
router.post('/', collectionController.create);
router.get('/', collectionController.getAll); // Всі мої
router.get('/public', collectionController.getPublic); // 👈 ПЕРЕМІСТИЛИ СЮДИ (перед /:id)
router.put('/reorder', collectionController.reorder); // 👈 Це теж краще вище

// 2. Роути для Artwork
router.get('/artwork/:id', collectionController.getByArtwork);

// 3. Потім динамічні роути (з параметрами :id)
router.get('/:id', collectionController.getOne); // 👈 Цей "з'їдає" все, що схоже на ID
router.delete('/:id', collectionController.delete);
router.put('/:id', collectionController.update); // Просте оновлення

// 4. Вкладені роути
router.post('/:id/items', collectionController.addItem);
router.delete('/:id/items/:artId', collectionController.removeItem);
router.put('/:id/batch', collectionController.updateBatch);
router.post('/:id/cover', upload.single('image'), collectionController.uploadCover);
router.delete('/:id/cover', collectionController.deleteCover);

module.exports = router;