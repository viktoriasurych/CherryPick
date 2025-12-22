const artworkDAO = require('../dao/artworkDAO');
const { deleteFile } = require('../utils/fileUtils');

class ArtworkService {
    
    async createArtwork(userId, data) {
        if (!data.title) throw new Error('Назва проекту є обов’язковою.');
        return await artworkDAO.create(userId, data);
    }

    async getAll(userId, filters, sort) { 
        return await artworkDAO.getAll(userId, filters, sort);
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

        // 👇 ЛОГІКА ЗБЕРЕЖЕННЯ СТАРОЇ ОБКЛАДИНКИ В ГАЛЕРЕЮ
        // Якщо прийшла НОВА картинка і вона відрізняється від СТАРОЇ...
        if (data.image_path && existing.image_path && data.image_path !== existing.image_path) {
            
            // 1. Перевіряємо через БД, чи це фото вже є в галереї
            const isAlreadyInGallery = await artworkDAO.checkGalleryImageExists(id, existing.image_path);
            
            if (!isAlreadyInGallery) {
                // 2. Якщо немає — додаємо стару обкладинку в архів
                await artworkDAO.addGalleryImage(id, existing.image_path, 'Колишня обкладинка');
            }
        }

        const updateData = {
            title: data.title !== undefined ? data.title : existing.title, // Перевірка на undefined, щоб не затерти пустим рядком
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status || existing.status,
            image_path: data.image_path || existing.image_path,
            
            style_id: data.style_id, 
            genre_id: data.genre_id,
            material_ids: data.material_ids,
            tag_ids: data.tag_ids,

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
        const artwork = await artworkDAO.findById(id);
        if (!artwork) throw new Error('Проект не знайдено.');
        if (artwork.user_id !== userId) throw new Error('Ви не маєте прав видаляти цей проект.');

        const result = await artworkDAO.delete(id, userId);
        
        // Видаляємо файл з диска
        if (result.changes > 0 && artwork.image_path) {
            deleteFile(artwork.image_path);
        }

        return { message: 'Проект видалено.' };
    }

    async updateStatus(id, userId, status, finishedData) {
        return await artworkDAO.updateStatus(id, userId, status, finishedData);
    }

    async addGalleryImage(artworkId, imagePath, description) {
        if (!artworkId) throw new Error('ID проекту обов’язкове.');
        if (!imagePath) throw new Error('Файл зображення обов’язковий.');
        
        return await artworkDAO.addGalleryImage(artworkId, imagePath, description);
    }

    async removeGalleryImage(imageId, userId) {
        // 1. Знаходимо картинку в базі
        const image = await artworkDAO.getGalleryImageById(imageId);
        if (!image) throw new Error('Зображення не знайдено');

        // 2. Перевіряємо права (через власника картини)
        const artwork = await artworkDAO.findById(image.artwork_id);
        if (artwork.user_id !== userId) {
            throw new Error('Ви не маєте прав видаляти це фото.');
        }

        // 3. Видаляємо файл з диска 🗑️
        deleteFile(image.image_path);

        // 4. Видаляємо запис з таблиці
        await artworkDAO.deleteGalleryImage(imageId);

        return { message: 'Фото видалено' };
    }
}

module.exports = new ArtworkService();