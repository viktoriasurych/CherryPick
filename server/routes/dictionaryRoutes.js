const Router = require('express');
const router = new Router();
const dictionaryController = require('../controllers/dictionaryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:type', authMiddleware, dictionaryController.getAll);
router.post('/:type', authMiddleware, dictionaryController.create);
router.delete('/:type/:id', authMiddleware, dictionaryController.delete);

module.exports = router;