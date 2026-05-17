const Router = require('express');
const router = new Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Шлях буде: /api/ai/analyze
router.post('/analyze', authMiddleware, aiController.analyzeArt);

module.exports = router;