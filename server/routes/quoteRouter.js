const Router = require('express');
const router = new Router();
const quoteController = require('../controllers/quoteController');

// GET /api/quotes/random
router.get('/random', quoteController.getRandom);

module.exports = router;