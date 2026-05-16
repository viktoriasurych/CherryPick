const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

const optimizeImage = require('../middleware/optimizeImage');

// приватне
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), optimizeImage, userController.uploadAvatar);
router.delete('/me/avatar', authMiddleware, userController.deleteAvatar);

// публ
router.get('/:id', userController.getPublicProfile);
module.exports = router;