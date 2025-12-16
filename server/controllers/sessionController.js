const sessionService = require('../services/sessionService');

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
            const sessionId = req.params.id;
            const { duration, content } = req.body;
            
            // Обробка файлу (якщо завантажили фото прогресу)
            const photo_path = req.file ? 'uploads/' + req.file.filename : null;

            const noteData = {
                content: content,
                photo_path: photo_path
            };

            const result = await sessionService.finishSession(sessionId, duration, noteData);
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