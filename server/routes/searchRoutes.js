const express = require('express');
const router = express.Router();
const userDAO = require('../dao/userDAO');
const collectionDAO = require('../dao/collectionDAO');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    const { q } = req.query;
    
    // Якщо менше 2 символів — повертаємо пусті масиви
    if (!q || q.length < 2) {
        return res.json({ users: [], collections: [] });
    }

    try {
        // Виконуємо пошук паралельно
        const [users, collections] = await Promise.all([
            userDAO.searchUsers(q),
            collectionDAO.searchCollections(q)
        ]);

        console.log(`🔎 Пошук за запитом "${q}": знайдено ${users.length} юзерів і ${collections.length} колекцій`);
        
        res.json({ users, collections });
    } catch (e) {
        console.error("❌ Помилка глобального пошуку:", e.message);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;