// 👇 ТЕПЕР МИ ІМПОРТУЄМО СЕРВІС, А НЕ DAO
const userService = require('../services/userService');
const { validate } = require('../utils/validation'); // 👇 1. Імпортуємо валідатор

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
            // 👇 2. Перевіряємо дані перед оновленням
            const errors = validate.user(req.body);
            if (errors.length > 0) {
                return res.status(400).json({ message: errors.join('. ') });
            }

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

    // Отримати публічний профіль (по ID або по Nickname)
 // Отримати публічний профіль (по ID або по Nickname)
 async getPublicProfile(req, res) {
    try {
        const identifier = req.params.id; 
        let user;
        
        if (/^\d+$/.test(identifier)) {
            user = await userService.getProfile(identifier);
        } else {
            user = await userService.getByNickname(identifier);
        }

        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        // Повертаємо безпечні дані
        const publicData = {
            id: user.id,
            nickname: user.nickname,
            display_name: user.display_name || user.nickname,
            avatar_url: user.avatar_url,
            bio: user.bio,
            location: user.location, // Можна додати і локацію, якщо треба
            
            // Соцмережі (теж варто додати, якщо вони публічні)
            social_telegram: user.social_telegram,
            social_instagram: user.social_instagram,
            social_twitter: user.social_twitter,
            social_artstation: user.social_artstation,
            social_behance: user.social_behance,
            social_website: user.social_website,
            contact_email: user.contact_email,

            // 👇 ВАЖЛИВО: Додаємо налаштування приватності
            show_global_stats: user.show_global_stats,
            show_kpi_stats: user.show_kpi_stats,
            show_heatmap_stats: user.show_heatmap_stats,
            
            created_at: user.created_at
        };
        res.json(publicData);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}
}

module.exports = new UserController();