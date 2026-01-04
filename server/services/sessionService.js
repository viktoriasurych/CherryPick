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

    async stopSession(userId, sessionId, noteData, manualDuration, addToGallery) { 
        const session = await this.getCurrentSession(userId);
        if (!session) throw new Error("Немає активної сесії");
        if (sessionId && parseInt(sessionId) !== session.id) {
            throw new Error("Помилка синхронізації: ID сесії не співпадає.");
        }

        const finalDuration = manualDuration !== null && manualDuration !== undefined
            ? manualDuration 
            : session.current_total_seconds;
        
        await sessionDAO.stop(session.id, finalDuration);

        const noteContent = noteData?.content || '';
        const photoPath = noteData?.photo_path || null;

        if (noteContent || photoPath) {
            await sessionDAO.createNote(session.id, noteContent, photoPath);
        }

        if (photoPath && session.artwork_id && addToGallery) {
            const exists = await artworkDAO.checkGalleryImageExists(session.artwork_id, photoPath);
            if (!exists) {
                await artworkDAO.addGalleryImage(session.artwork_id, photoPath, 'Фото з сесії');
            }
        }

        return { message: "Сесію успішно завершено", duration: finalDuration };
    }

    async getHistory(artworkId) {
        return await sessionDAO.getByArtworkId(artworkId); 
    }

    async discardSession(userId) {
        const session = await sessionDAO.findActive(userId);
        if (session) {
            await sessionDAO.delete(session.id);
        }
        return { message: "Сесію скасовано" };
    }
}

module.exports = new SessionService();