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
    async updateProfile(userId, data) {
        const updatedUser = await userDAO.updateProfile(userId, data);
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