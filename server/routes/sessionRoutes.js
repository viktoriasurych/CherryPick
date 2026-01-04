const Router = require('express');
const router = new Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.get('/current', authMiddleware, sessionController.getCurrent);
router.post('/start', authMiddleware, sessionController.start);
router.post('/pause', authMiddleware, sessionController.togglePause);
router.post('/stop', authMiddleware, upload.single('image'), sessionController.stop);
router.get('/history/:artworkId', authMiddleware, sessionController.getHistory);
router.post('/discard', authMiddleware, sessionController.discard);

module.exports = router;