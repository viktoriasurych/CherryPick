const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'fallback_secret'; // Переконайся, що секрет такий самий, як в authMiddleware

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        // Перевіряємо, чи є заголовок взагалі
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(); // Немає заголовка -> йди далі як гість
        }

        const token = authHeader.split(' ')[1]; 
        if (!token) {
            return next(); // Немає токена -> йди далі як гість
        }

        // Пробуємо розшифрувати
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // ✅ УСПІХ: Записуємо юзера
        next();

    } catch (e) {
        // Якщо токен прострочений або лівий -> просто ігноруємо це
        // Користувач буде вважатися гостем
        next();
    }
};