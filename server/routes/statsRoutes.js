const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/stats?year=2025
router.get('/', authMiddleware, statsController.getStats);
router.get('/', statsController.getStats);

module.exports = router;