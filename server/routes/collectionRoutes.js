const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, collectionController.create);
router.get('/', authMiddleware, collectionController.getAll);
router.delete('/:id', authMiddleware, collectionController.delete);

module.exports = router;