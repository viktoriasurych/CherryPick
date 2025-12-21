const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

// 1. СПОЧАТКУ КОНКРЕТНІ МАРШРУТИ
// 🔐 Отримати "Мій" профіль
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', authMiddleware, userController.deleteAvatar);

// 2. ПОТІМ ДИНАМІЧНІ (Wildcards)
// 🔓 Отримати дані будь-якого художника за ID (Це має бути останнім get)
router.get('/:id', userController.getById);

module.exports = router;