const authService = require('../services/authService');

class AuthController {
    
    async register(req, res) {
        try {
            const { nickname, email, password } = req.body;
            if (!nickname || !email || !password) {
                return res.status(400).json({ message: 'Заповніть всі поля!' });
            }
            const data = await authService.register(nickname, email, password);
            res.status(201).json(data); 
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.json(data);
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }

    async googleLogin(req, res) {
        try {
            const { token } = req.body;
            const data = await authService.googleLogin(token);
            res.json(data);
        } catch (e) {
            console.error("Google Auth Error:", e);
            res.status(400).json({ message: "Помилка авторизації Google" });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const message = await authService.forgotPassword(email);
            res.json({ message });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Помилка сервера" });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, token, newPassword } = req.body;
            const message = await authService.resetPassword(email, token, newPassword);
            res.json({ message });
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }
}

module.exports = new AuthController();