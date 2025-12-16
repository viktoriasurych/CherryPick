const Router = require('express');
const router = new Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload'); // Використовуємо той самий завантажувач

// Почати сесію
router.post('/start', authMiddleware, sessionController.start);

// Завершити сесію (може містити файл 'image')
router.post('/:id/finish', authMiddleware, upload.single('image'), sessionController.finish);

// Отримати історію для конкретної картини
router.get('/history/:artworkId', authMiddleware, sessionController.getHistory);

module.exports = router;