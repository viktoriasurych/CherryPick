// server/controllers/authController.js
const authService = require('../services/authService');

class AuthController {
    
    // POST /api/auth/register
    async register(req, res) {
        try {
            const { nickname, email, password } = req.body;
            
            if (!nickname || !email || !password) {
                return res.status(400).json({ message: 'Заповніть всі поля!' });
            }

            // data тепер містить { token, user }
            const data = await authService.register(nickname, email, password);
            
            // 201 Created + дані для авто-входу
            res.status(201).json(data); 
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