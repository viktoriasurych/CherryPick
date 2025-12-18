
const artworkDAO = require('../dao/artworkDAO');

class ArtworkService {
    
    async createArtwork(userId, data) {
        if (!data.title) throw new Error('Назва проекту є обов’язковою.');
        return await artworkDAO.create(userId, data);
    }

    async getUserGallery(userId) {
        // DAO метод називається getAll
        return await artworkDAO.getAll(userId);
    }

    async getArtworkById(id) {
        const artwork = await artworkDAO.findById(id);
        if (!artwork) throw new Error('Проект не знайдено.');
        return artwork;
    }

    async updateArtwork(id, userId, data) {
        const existing = await artworkDAO.findById(id);
        if (!existing) throw new Error('Проект не знайдено.');
        if (existing.user_id !== userId) throw new Error('Ви не маєте прав редагувати цей проект.');

        const updateData = {
            title: data.title || existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status || existing.status,
            image_path: data.image_path || existing.image_path,
            
            style_id: data.style_id, 
            genre_id: data.genre_id,
            material_ids: data.material_ids,
            tag_ids: data.tag_ids,

            // Дати
            started_year: data.started_year,
            started_month: data.started_month,
            started_day: data.started_day,
            finished_year: data.finished_year,
            finished_month: data.finished_month,
            finished_day: data.finished_day
        };

        await artworkDAO.update(id, userId, updateData);
        return { message: 'Проект оновлено', updatedData: updateData };
    }

    async deleteArtwork(id, userId) {
        const result = await artworkDAO.delete(id, userId);
        if (result.changes === 0) throw new Error('Проект не знайдено.');
        return { message: 'Проект видалено.' };
    }

    // 👇 ВИПРАВЛЕНИЙ МЕТОД UPDATE STATUS
    // Він просто передає дані в DAO, без req/res
    async updateStatus(id, userId, status, finishedData) {
        return await artworkDAO.updateStatus(id, userId, status, finishedData);
    }
}

module.exports = new ArtworkService();