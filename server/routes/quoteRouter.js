const Router = require('express');
const router = new Router();
const quoteController = require('../controllers/quoteController');

router.get('/random', quoteController.getRandom);

module.exports = router;