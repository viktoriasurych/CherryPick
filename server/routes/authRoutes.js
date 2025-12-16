// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршрут: http://localhost:3000/api/auth/register
router.post('/register', authController.register);

// Маршрут: http://localhost:3000/api/auth/login
router.post('/login', authController.login);

module.exports = router;