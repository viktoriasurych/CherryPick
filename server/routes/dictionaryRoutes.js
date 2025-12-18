const Router = require('express');
const router = new Router();
const dictionaryController = require('../controllers/dictionaryController');
const authMiddleware = require('../middleware/authMiddleware');

// Отримати список (наприклад: /api/dict/styles)
router.get('/:type', authMiddleware, dictionaryController.getAll);

// Додати свій варіант
router.post('/:type', authMiddleware, dictionaryController.create);

// Видалити свій варіант
router.delete('/:type/:id', authMiddleware, dictionaryController.delete);

module.exports = router;