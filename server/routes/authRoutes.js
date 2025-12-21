// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); //

// Маршрут: http://localhost:3000/api/auth/register
router.post('/register', authController.register);

// Маршрут: http://localhost:3000/api/auth/login
router.post('/login', authController.login);

router.post('/google', authController.googleLogin);
// 👇 ДОДАЙ ЦІ ДВА РЯДКИ (для відновлення паролю)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;