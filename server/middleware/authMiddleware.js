// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'fallback_secret';

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        // Отримуємо токен з заголовка: "Bearer kjahsdjkahs..."
        const token = req.headers.authorization.split(' ')[1]; 
        
        if (!token) {
            return res.status(401).json({message: "Не авторизований"});
        }

        // Розшифровуємо токен
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Записуємо дані юзера в запит
        next(); // Пропускаємо далі до контролера

    } catch (e) {
        res.status(401).json({message: "Не авторизований (Токен невірний)"});
    }
};