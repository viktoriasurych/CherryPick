const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

// ВАЖЛИВО: Всі ці маршрути захищені. Без токена сюди не пустить.
router.use(authMiddleware);

// GET /api/users/me -> Отримати мій профіль
router.get('/me', userController.getProfile);

// PUT /api/users/me -> Оновити текстові поля (нік, біо, інста...)
router.put('/me', userController.updateProfile);

// POST /api/users/me/avatar -> Завантажити нову фотку
// 'avatar' - це name="avatar" у FormData на фронтенді
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);

router.delete('/me/avatar', userController.deleteAvatar);

router.get('/:id', userController.getById);

module.exports = router;