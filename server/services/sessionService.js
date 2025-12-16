const sessionDAO = require('../dao/sessionDAO');

class SessionService {

    // Почати роботу
    async startSession(artworkId) {
        if (!artworkId) throw new Error("ID проєкту обов'язкове");
        const sessionId = await sessionDAO.create(artworkId);
        return { id: sessionId, status: 'STARTED' };
    }

    // Завершити роботу (і зберегти нотатку, якщо є)
    async finishSession(sessionId, duration, noteData) {
        // 1. Оновлюємо час і тривалість сесії
        await sessionDAO.updateDuration(sessionId, duration);

        // 2. Якщо користувач додав нотатку або фото — зберігаємо їх
        // noteData = { content: "...", photo_path: "..." }
        if (noteData && (noteData.content || noteData.photo_path)) {
            await sessionDAO.createNote(
                sessionId, 
                noteData.content || '', 
                noteData.photo_path || null
            );
        }

        return { message: "Session saved successfully" };
    }

    // Отримати історію
    async getHistory(artworkId) {
        return await sessionDAO.getByArtworkId(artworkId);
    }
}

module.exports = new SessionService();