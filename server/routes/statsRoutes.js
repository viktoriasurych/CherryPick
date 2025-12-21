const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
// const authMiddleware = require('../middleware/authMiddleware'); // 👈 Тут він не потрібен для публічного доступу

// GET /api/stats?userId=5&year=2025
// Ми прибрали authMiddleware, щоб гості не отримували помилку 401
router.get('/', statsController.getStats);

module.exports = router;