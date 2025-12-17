const artworkDAO = require('../dao/artworkDAO'); // Перевір шлях, зазвичай це database/artworkDAO

class ArtworkService {
    
    async createArtwork(userId, data) {
        if (!data.title) {
            throw new Error('Назва проекту є обов’язковою.');
        }
        return await artworkDAO.create(userId, data);
    }

    // 👇 ВИПРАВЛЕНО ТУТ
    async getUserGallery(userId) {
        // У DAO метод називається getAll, а не findAllByUserId
        return await artworkDAO.getAll(userId);
    }

    async getArtworkById(id) {
        const artwork = await artworkDAO.findById(id);
        if (!artwork) {
            throw new Error('Проект не знайдено.');
        }
        return artwork;
    }

    async updateArtwork(id, userId, data) {
        const existing = await artworkDAO.findById(id);
        if (!existing) {
            throw new Error('Проект не знайдено.');
        }
        if (existing.user_id !== userId) {
            throw new Error('Ви не маєте прав редагувати цей проект.');
        }

        // 👇 ВИПРАВЛЕНО ТУТ (Додали нові поля)
        const updateData = {
            title: data.title || existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status || existing.status,
            image_path: data.image_path || existing.image_path,
            
            // Нові поля (передаємо те, що прийшло, або undefined, щоб DAO розібрався)
            style_id: data.style_id, 
            genre_id: data.genre_id,
            material_ids: data.material_ids,
            tag_ids: data.tag_ids
        };

        await artworkDAO.update(id, userId, updateData);
        return { message: 'Проект успішно оновлено', updatedData: updateData };
    }

    async deleteArtwork(id, userId) {
        const changes = await artworkDAO.delete(id, userId);
        // changes.changes для sqlite, але ми в DAO повертаємо об'єкт { message, changes }
        if (changes.changes === 0) {
            throw new Error('Проект не знайдено або ви не є його власником.');
        }
        return { message: 'Проект видалено.' };
    }

    async updateStatus(id, userId, status) {
        return await artworkDAO.updateStatus(id, userId, status);
    }
}

module.exports = new ArtworkService();