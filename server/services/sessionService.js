const sessionDAO = require('../dao/sessionDAO');
const artworkDAO = require('../dao/artworkDAO');

class SessionService {

    async startSession(artworkId) {
        if (!artworkId) throw new Error("ID проєкту обов'язкове");
        const sessionId = await sessionDAO.create(artworkId);
        return { id: sessionId, status: 'STARTED' };
    }

    async finishSession(sessionId, duration, noteData, userId, artworkId, updateCover) {
        
        await sessionDAO.updateDuration(sessionId, duration);

        if (noteData && (noteData.content || noteData.photo_path)) {
            await sessionDAO.createNote(
                sessionId, 
                noteData.content || '', 
                noteData.photo_path || null
            );

            // Якщо є фото...
            if (noteData.photo_path && artworkId && userId) {
                
                // 1. Якщо користувач захотів оновити обкладинку
                if (updateCover) {
                    const existing = await artworkDAO.findById(artworkId);
                    if (existing) {
                        // А. Рятуємо стару обкладинку (якщо вона була і це не те саме фото)
                        if (existing.image_path && existing.image_path !== noteData.photo_path) {
                            // 👇 ПЕРЕВІРКА: Чи є вже стара обкладинка в галереї?
                            const exists = await artworkDAO.checkGalleryImageExists(artworkId, existing.image_path);
                            if (!exists) {
                                await artworkDAO.addGalleryImage(artworkId, existing.image_path, 'Архівна обкладинка');
                            }
                        }

                        // Б. Оновлюємо головну
                        const updateData = {
                            // ... копіюємо старі поля, щоб не затерти ...
                            title: existing.title, description: existing.description, status: existing.status,
                            style_id: existing.style_id, genre_id: existing.genre_id,
                            material_ids: existing.material_ids, tag_ids: existing.tag_ids,
                            started_year: existing.started_year, started_month: existing.started_month, started_day: existing.started_day,
                            finished_year: existing.finished_year, finished_month: existing.finished_month, finished_day: existing.finished_day,
                            
                            image_path: noteData.photo_path // Нова обкладинка
                        };
                        await artworkDAO.update(artworkId, userId, updateData);

                        // В. Додаємо НОВУ обкладинку в галерею (щоб була в історії фото)
                        // 👇 ПЕРЕВІРКА: Чи є вже це нове фото в галереї?
                        const newExists = await artworkDAO.checkGalleryImageExists(artworkId, noteData.photo_path);
                        if (!newExists) {
                            await artworkDAO.addGalleryImage(artworkId, noteData.photo_path, 'Фото з сесії');
                        }
                    }
                } 
                // 2. Якщо НЕ оновлюємо обкладинку, а просто зберігаємо фото в галерею
                else {
                    const exists = await artworkDAO.checkGalleryImageExists(artworkId, noteData.photo_path);
                    if (!exists) {
                        await artworkDAO.addGalleryImage(artworkId, noteData.photo_path, 'Фото з сесії');
                    }
                }
            }
        }

        return { message: "Session saved successfully" };
    }

    async getHistory(artworkId) {
        return await sessionDAO.getByArtworkId(artworkId);
    }
}

module.exports = new SessionService();