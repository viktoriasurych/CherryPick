const stickyNoteDAO = require('../dao/stickyNoteDAO');

class StickyNoteService {
    
    async getAll(userId) {
        return await stickyNoteDAO.getAll(userId);
    }

    async create(userId, data) {
        const title = data.title || 'Нова нотатка';
        const content = data.content || '';
        const color = data.color || 'yellow';
        
        return await stickyNoteDAO.create(userId, { title, content, color });
    }

    async update(id, userId, data) {
        // 1. Перевірка власності
        const note = await stickyNoteDAO.findById(id);
        if (!note) throw new Error('Нотатку не знайдено');
        if (note.user_id !== userId) throw new Error('Доступ заборонено');

        // 2. Оновлення
        return await stickyNoteDAO.update(id, data);
    }

    async delete(id, userId) {
        // 1. Перевірка власності
        const note = await stickyNoteDAO.findById(id);
        if (!note) throw new Error('Нотатку не знайдено');
        if (note.user_id !== userId) throw new Error('Доступ заборонено');

        // 2. Видалення
        return await stickyNoteDAO.delete(id);
    }
}

module.exports = new StickyNoteService();