const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware'); // 👈 1. Переконайся, що це імпортовано

// 🔐 Отримати статистику (Тільки для авторизованих!)
// 👇 2. Додай authMiddleware другим аргументом
router.get('/', authMiddleware, statsController.getStats); 

module.exports = router;