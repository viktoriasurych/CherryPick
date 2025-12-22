const sessionService = require('../services/sessionService');
const { validate } = require('../utils/validation'); // 👇 1. Імпорт

class SessionController {

    // POST /api/sessions/start
    async start(req, res) {
        try {
            const { artworkId } = req.body;
            const result = await sessionService.startSession(artworkId);
            res.status(201).json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    // POST /api/sessions/:id/finish
    // Сюди прийде: duration (секунди), content (текст), image (файл)
    async finish(req, res) {
        try {
            // 👇 2. ВАЛІДАЦІЯ НОТАТКИ
            // Ми перевіряємо поле 'content', яке прийшло з форми
            const errors = validate.note({ content: req.body.content });
            if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') });

            const sessionId = req.params.id;
            const userId = req.user.id;
            
            const { duration, content, artworkId, updateCover } = req.body; 
            const photo_path = req.file ? 'uploads/' + req.file.filename : null;

            const noteData = {
                content: content,
                photo_path: photo_path
            };

            const isUpdateCover = updateCover === 'true';

            const result = await sessionService.finishSession(
                sessionId, 
                duration, 
                noteData, 
                userId, 
                artworkId, 
                isUpdateCover
            );
            
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: e.message });
        }
    }

    // GET /api/sessions/history/:artworkId
    async getHistory(req, res) {
        try {
            const { artworkId } = req.params;
            const history = await sessionService.getHistory(artworkId);
            res.json(history);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new SessionController();