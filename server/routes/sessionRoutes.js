const Router = require('express');
const router = new Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload'); // Твій завантажувач

// 👇 1. ОТРИМАТИ СТАН (Щоб сторінка таймера знала, чи він тікає)
router.get('/current', authMiddleware, sessionController.getCurrent);

// 👇 2. ПОЧАТИ СЕАНС
router.post('/start', authMiddleware, sessionController.start);

// 👇 3. ПАУЗА / ВІДНОВИТИ (Працює як вмикач/вимикач)
router.post('/pause', authMiddleware, sessionController.togglePause);

// 👇 4. ЗАВЕРШИТИ (СТОП)
// Ми прибрали /:id, бо зупиняємо ПОТОЧНУ активну сесію юзера
router.post('/stop', authMiddleware, upload.single('image'), sessionController.stop);

// 👇 5. ІСТОРІЯ (Тут без змін)
router.get('/history/:artworkId', authMiddleware, sessionController.getHistory);

module.exports = router;