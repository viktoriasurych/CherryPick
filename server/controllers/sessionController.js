const sessionService = require('../services/sessionService');
const { validate } = require('../utils/validation');

class SessionController {

    async getCurrent(req, res) {
        try {
            const session = await sessionService.getCurrentSession(req.user.id);
            res.json(session);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async start(req, res) {
        try {
            const { artworkId } = req.body;
            const result = await sessionService.startSession(req.user.id, artworkId);
            res.status(201).json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async togglePause(req, res) {
        try {
            const result = await sessionService.togglePause(req.user.id);
            res.json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async stop(req, res) {
        try {
            const userId = req.user.id;
            const photo_path = req.file ? 'uploads/' + req.file.filename : null;

            const { manualDuration, content, updateCover, sessionId } = req.body;

            const noteData = {
                content: content || '',
                photo_path: photo_path 
            };

            const isUpdateCover = updateCover === 'true'; 
            const durationSeconds = manualDuration ? parseInt(manualDuration) : null;

            const result = await sessionService.stopSession(
                userId, 
                sessionId,
                noteData, 
                durationSeconds, 
                isUpdateCover
            );
            
            res.json(result);
        } catch (e) {
            console.error("Stop error:", e);
            res.status(400).json({ message: e.message });
        }
    }

    async getHistory(req, res) {
        try {
            const { artworkId } = req.params;
            const history = await sessionService.getHistory(artworkId);
            res.json(history);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async discard(req, res) {
        try {
            await sessionService.discardSession(req.user.id);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new SessionController();