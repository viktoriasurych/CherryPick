// 👇 ТЕПЕР МИ ІМПОРТУЄМО СЕРВІС, А НЕ DAO
const userService = require('../services/userService');

class UserController {
    
    async getProfile(req, res) {
        try {
            const user = await userService.getProfile(req.user.id);
            res.json(user);
        } catch (e) {
            // Якщо помилка "не знайдено", даємо 404, інакше 500
            if (e.message === 'Користувача не знайдено') {
                return res.status(404).json({ message: e.message });
            }
            console.error(e);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }

    async updateProfile(req, res) {
        try {
            const updatedUser = await userService.updateProfile(req.user.id, req.body);
            res.json(updatedUser);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Не вдалося оновити профіль' });
        }
    }

    async uploadAvatar(req, res) {
        try {
            // Передаємо req.file у сервіс
            const result = await userService.uploadAvatar(req.user.id, req.file);
            res.json(result);
        } catch (e) {
            console.error(e);
            // Якщо помилка від сервісу (наприклад, немає файлу) - 400, інакше 500
            const status = e.message === 'Файл не передано' ? 400 : 500;
            res.status(status).json({ message: e.message });
        }
    }
    async deleteAvatar(req, res) {
        try {
            await userService.deleteAvatar(req.user.id); // Або напряму DAO, якщо сервіс не оновлювала
            res.json({ message: 'Аватар видалено', avatar_url: null });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Помилка видалення фото' });
        }
    }

    // 👇 ДОДАЙ ЦЕЙ МЕТОД, ЯКЩО ЙОГО НЕМАЄ
    async getById(req, res) {
        try {
            const user = await userService.getProfile(req.params.id);
            res.json(user);
        } catch (e) {
            // Якщо юзера немає, повертаємо 404
            res.status(404).json({ message: 'Користувача не знайдено' });
        }
    }
}

module.exports = new UserController();