const userDAO = require('../dao/userDAO');
const fs = require('fs');     // ✅ Для роботи з файлами (видалення)
const path = require('path'); // ✅ Для правильних шляхів (Windows/Linux/Mac)

class UserService {
    
    // Отримати профіль
    async getProfile(userId) {
        const user = await userDAO.findById(userId);
        if (!user) {
            throw new Error('Користувача не знайдено');
        }
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }

    // Оновити текстові дані
    // Оновити текстові дані
    async updateProfile(userId, data) {
        // 1. Отримуємо поточні дані юзера з бази
        const currentUser = await userDAO.findById(userId);
        
        if (!currentUser) {
            throw new Error('Користувача не знайдено');
        }

        // 2. Зливаємо старі дані з новими.
        // Якщо в 'data' немає якогось поля (наприклад nickname), беремо його з 'currentUser'.
        // Це врятує нас від перезапису полів на NULL.
        
        const mergedData = {
            nickname: data.nickname || currentUser.nickname,
            display_name: data.display_name || currentUser.display_name,
            bio: data.bio !== undefined ? data.bio : currentUser.bio, // перевірка на undefined, бо bio може бути пустим рядком
            location: data.location !== undefined ? data.location : currentUser.location,
            
            contact_email: data.contact_email !== undefined ? data.contact_email : currentUser.contact_email,
            social_telegram: data.social_telegram !== undefined ? data.social_telegram : currentUser.social_telegram,
            social_instagram: data.social_instagram !== undefined ? data.social_instagram : currentUser.social_instagram,
            social_twitter: data.social_twitter !== undefined ? data.social_twitter : currentUser.social_twitter,
            social_artstation: data.social_artstation !== undefined ? data.social_artstation : currentUser.social_artstation,
            social_behance: data.social_behance !== undefined ? data.social_behance : currentUser.social_behance,
            social_website: data.social_website !== undefined ? data.social_website : currentUser.social_website,

            // Для булевих значень (прапорців) перевіряємо, чи передали їх взагалі
            // Якщо передали (true/false) - беремо нове. Якщо ні (undefined) - беремо старе.
            show_global_stats: data.show_global_stats !== undefined ? data.show_global_stats : currentUser.show_global_stats,
            show_kpi_stats: data.show_kpi_stats !== undefined ? data.show_kpi_stats : currentUser.show_kpi_stats,
            show_heatmap_stats: data.show_heatmap_stats !== undefined ? data.show_heatmap_stats : currentUser.show_heatmap_stats,
        };

        // 3. Віддаємо DAO вже повний, гарний об'єкт
        const updatedUser = await userDAO.updateProfile(userId, mergedData);
        
        const { password_hash, ...safeUser } = updatedUser;
        return safeUser;
    }

    async uploadAvatar(userId, file) {
        // 1. Спочатку видаляємо старий аватар, якщо він був
        const currentUser = await userDAO.findById(userId);
        if (currentUser && currentUser.avatar_url) {
             this._deleteFile(currentUser.avatar_url);
        }

        if (!file) throw new Error('Файл не передано');
        const avatarUrl = `/uploads/${file.filename}`;
        await userDAO.updateAvatar(userId, avatarUrl);
        return { avatar_url: avatarUrl };
    }

    async deleteAvatar(userId) {
        // 1. Отримуємо поточного юзера, щоб знати шлях до файлу
        const user = await userDAO.findById(userId);
        if (user && user.avatar_url) {
            // 2. Видаляємо файл з диска
            this._deleteFile(user.avatar_url);
        }
        // 3. Очищаємо запис в БД
        return await userDAO.deleteAvatar(userId);
    }

    // Допоміжний приватний метод
    _deleteFile(avatarUrl) {
        try {
            // avatarUrl приходить як "/uploads/file.jpg"
            const fileName = avatarUrl.split('/').pop(); // беремо "file.jpg"
            
            // Тепер 'path' буде працювати, бо ми його підключили зверху
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            // І 'fs' теж буде працювати
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Файл видалено: ${filePath}`);
            }
        } catch (e) {
            console.error("Помилка видалення файлу:", e);
        }
    }

    async getByNickname(nickname) {
        // Треба додати findByNickname в DAO, якщо його ще немає
        const user = await userDAO.findByNickname(nickname);
        if (!user) return null;
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}

module.exports = new UserService();