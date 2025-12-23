const sessionDAO = require('../dao/sessionDAO');
const artworkDAO = require('../dao/artworkDAO');

const MAX_SESSION_SECONDS = 12 * 60 * 60;

class SessionService {

    async getCurrentSession(userId) {
        const session = await sessionDAO.findActive(userId);
        if (!session) return null;

        let totalSeconds = session.duration_seconds;
        if (session.start_time) {
            const start = new Date(session.start_time).getTime();
            const now = new Date().getTime();
            const diffInSeconds = Math.floor((now - start) / 1000);

            if (diffInSeconds > MAX_SESSION_SECONDS) {
                const cappedDuration = totalSeconds + MAX_SESSION_SECONDS;
                await sessionDAO.pause(session.id, cappedDuration);
                return { ...session, start_time: null, current_total_seconds: cappedDuration, is_running: false, auto_paused: true };
            }
            totalSeconds += diffInSeconds;
        }
        return { ...session, current_total_seconds: totalSeconds, is_running: !!session.start_time };
    }

    async startSession(userId, artworkId) {
        if (!artworkId) throw new Error("ID проєкту обов'язкове");
        const active = await sessionDAO.findActive(userId);
        if (active) {
            if (active.artwork_id === parseInt(artworkId)) {
                if (!active.start_time) await sessionDAO.resume(active.id);
                return this.getCurrentSession(userId);
            }
            throw new Error("У вас вже є активний сеанс з іншою картиною!");
        }
        await sessionDAO.start(userId, artworkId);
        return this.getCurrentSession(userId);
    }

    async togglePause(userId) {
        const session = await this.getCurrentSession(userId);
        if (!session) throw new Error("Немає активної сесії");

        if (session.is_running) {
            await sessionDAO.pause(session.id, session.current_total_seconds);
        } else {
            await sessionDAO.resume(session.id);
        }
        return this.getCurrentSession(userId);
    }

    // 👇 ОНОВЛЕНИЙ STOP (Найважливіше місце)
    async stopSession(userId, noteData, manualDuration, updateCover) {
        const session = await this.getCurrentSession(userId);
        if (!session) throw new Error("Немає активної сесії");

        // 1. Визначаємо час
        const finalDuration = manualDuration !== null && manualDuration !== undefined
            ? manualDuration 
            : session.current_total_seconds;
        
        // 2. Закриваємо сесію в таблиці SESSIONS (тільки час)
        await sessionDAO.stop(session.id, finalDuration);

        // 3. 👇 Створюємо запис у таблиці NOTES (Текст + Фото)
        const noteContent = noteData?.content || '';
        const photoPath = noteData?.photo_path || null;

        // Якщо є хоч щось (текст або фото), створюємо запис в notes
        if (noteContent || photoPath) {
            await sessionDAO.createNote(session.id, noteContent, photoPath);
        }

        // 4. Логіка Галереї та Обкладинки (твоя стара логіка)
        const artworkId = session.artwork_id;

        if (photoPath && artworkId) {
            // ... (тут без змін, бо ти працюєш через artworkDAO, який ми не чіпали)
            if (updateCover) {
                const existing = await artworkDAO.findById(artworkId);
                if (existing) {
                    if (existing.image_path && existing.image_path !== photoPath) {
                        const exists = await artworkDAO.checkGalleryImageExists(artworkId, existing.image_path);
                        if (!exists) await artworkDAO.addGalleryImage(artworkId, existing.image_path, 'Архівна обкладинка');
                    }

                    const updateData = {
                        title: existing.title, description: existing.description, status: existing.status,
                        style_id: existing.style_id, genre_id: existing.genre_id,
                        material_ids: existing.material_ids, tag_ids: existing.tag_ids,
                        started_year: existing.started_year, started_month: existing.started_month, started_day: existing.started_day,
                        finished_year: existing.finished_year, finished_month: existing.finished_month, finished_day: existing.finished_day,
                        image_path: photoPath 
                    };
                    await artworkDAO.update(artworkId, userId, updateData);

                    const newExists = await artworkDAO.checkGalleryImageExists(artworkId, photoPath);
                    if (!newExists) await artworkDAO.addGalleryImage(artworkId, photoPath, 'Фото з сесії');
                }
            } else {
                const exists = await artworkDAO.checkGalleryImageExists(artworkId, photoPath);
                if (!exists) await artworkDAO.addGalleryImage(artworkId, photoPath, 'Фото з сесії');
            }
        }

        return { message: "Сесію успішно завершено", duration: finalDuration };
    }

    async getHistory(artworkId) {
        return await sessionDAO.getByArtworkId(artworkId); 
    }

    // 👇 НОВИЙ МЕТОД
    async discardSession(userId) {
        const session = await sessionDAO.findActive(userId);
        if (session) {
            await sessionDAO.delete(session.id);
        }
        return { message: "Сесію скасовано" };
    }
}

module.exports = new SessionService();