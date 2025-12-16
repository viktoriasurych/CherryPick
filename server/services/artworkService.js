// server/services/artworkService.js
const artworkDAO = require('../dao/artworkDAO');

class ArtworkService {
    
    async createArtwork(userId, data) {
        // Перевірка обов'язкових полів
        if (!data.title) {
            throw new Error('Назва проекту є обов’язковою.');
        }
        return await artworkDAO.create(userId, data);
    }

    async getUserGallery(userId) {
        return await artworkDAO.findAllByUserId(userId);
    }

    async updateArtwork(id, userId, data) {
        // Спочатку перевіряємо, чи існує такий проект
        const existing = await artworkDAO.findById(id);
        if (!existing) {
            throw new Error('Проект не знайдено.');
        }
        // Перевіряємо, чи це проект цього користувача
        if (existing.user_id !== userId) {
            throw new Error('Ви не маєте прав редагувати цей проект.');
        }

        // Якщо все ок, оновлюємо
        // Зберігаємо старі дані, якщо нові не прийшли
        const updateData = {
            title: data.title || existing.title,
            description: data.description || existing.description,
            status: data.status || existing.status,
            image_path: data.image_path || existing.image_path,
            style_id: data.style_id || existing.style_id,
            material_id: data.material_id || existing.material_id,
        };

        await artworkDAO.update(id, userId, updateData);
        return { message: 'Проект успішно оновлено', updatedData: updateData };
    }

    async deleteArtwork(id, userId) {
        const changes = await artworkDAO.delete(id, userId);
        if (changes === 0) {
            throw new Error('Проект не знайдено або ви не є його власником.');
        }
        return { message: 'Проект видалено.' };
    }
}

module.exports = new ArtworkService();