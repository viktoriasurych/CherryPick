const stickyNoteService = require('../services/stickyNoteService');

class StickyNoteController {
    
    async getAll(req, res) {
        try {
            const notes = await stickyNoteService.getAll(req.user.id);
            res.json(notes);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async create(req, res) {
        try {
            const note = await stickyNoteService.create(req.user.id, req.body);
            res.status(201).json(note);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async update(req, res) {
        try {
            await stickyNoteService.update(req.params.id, req.user.id, req.body);
            res.json({ message: "Збережено" });
        } catch (e) {
            const status = e.message === 'Доступ заборонено' ? 403 : 500;
            res.status(status).json({ message: e.message });
        }
    }

    async delete(req, res) {
        try {
            await stickyNoteService.delete(req.params.id, req.user.id);
            res.json({ message: "Видалено" });
        } catch (e) {
            const status = e.message === 'Доступ заборонено' ? 403 : 500;
            res.status(status).json({ message: e.message });
        }
    }
}

module.exports = new StickyNoteController();