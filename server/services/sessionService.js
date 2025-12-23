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

    async stopSession(userId, noteData, manualDuration, addToGallery) { // addToGallery = це те саме що updateCover з контролера
        const session = await this.getCurrentSession(userId);
        if (!session) throw new Error("Немає активної сесії");

        // 1. Час
        const finalDuration = manualDuration !== null && manualDuration !== undefined
            ? manualDuration 
            : session.current_total_seconds;
        
        // 2. Стоп в БД
        await sessionDAO.stop(session.id, finalDuration);

        // 3. Нотатка (історія)
        const noteContent = noteData?.content || '';
        const photoPath = noteData?.photo_path || null;

        if (noteContent || photoPath) {
            // Фото ЗАВЖДИ зберігається в історії сесій (session_notes)
            await sessionDAO.createNote(session.id, noteContent, photoPath);
        }

        // 4. 👇 ГОЛОВНА ГАЛЕРЕЯ
        // Додаємо в галерею artwork ТІЛЬКИ якщо є фото І якщо галочка (addToGallery) == true
        if (photoPath && session.artwork_id && addToGallery) {
            const exists = await artworkDAO.checkGalleryImageExists(session.artwork_id, photoPath);
            if (!exists) {
                // Додаємо як "Фото з сесії"
                await artworkDAO.addGalleryImage(session.artwork_id, photoPath, 'Фото з сесії');
            }
        }
        // ❌ БЛОК ELSE ПРИБРАНО!
        // Раніше тут був else, який додавав фото, якщо галочка була false. Це була помилка.

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