// server/controllers/authController.js
const authService = require('../services/authService');

class AuthController {
    
    // POST /api/auth/register
    async register(req, res) {
        try {
            // Дістаємо дані з "тіла" запиту
            const { nickname, email, password } = req.body;
            
            // Валідація (щоб не прислали пусті поля)
            if (!nickname || !email || !password) {
                return res.status(400).json({ message: 'Заповніть всі поля!' });
            }

            const user = await authService.register(nickname, email, password);
            res.status(201).json({ message: 'Успішна реєстрація!', user });
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.json(data); // Віддаємо токен і юзера
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
}

module.exports = new AuthController();