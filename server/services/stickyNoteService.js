const stickyNoteDAO = require('../dao/stickyNoteDAO');

class StickyNoteService {
    
    async getAll(userId) {
        return await stickyNoteDAO.getAll(userId);
    }

    async create(userId, data) {
        // 👇 1. ЗМІНИЛИ НА АНГЛІЙСЬКУ ТА КОЛІР 'PINK'
        const title = data.title || 'New Scroll'; // Замість 'Нова нотатка'
        const content = data.content || '';
        const color = data.color || 'pink';       // Замість 'yellow', бо ми вирішили, що pink (blood) головний
        
        return await stickyNoteDAO.create(userId, { title, content, color });
    }

    async update(id, userId, data) {
        // 1. Перевірка власності
        const note = await stickyNoteDAO.findById(id);
        
        // 👇 2. ПОМИЛКИ ТЕЖ АНГЛІЙСЬКОЮ
        if (!note) throw new Error('Scroll not found');
        if (note.user_id !== userId) throw new Error('Access denied');

        // 2. Оновлення
        return await stickyNoteDAO.update(id, data);
    }

    async delete(id, userId) {
        // 1. Перевірка власності
        const note = await stickyNoteDAO.findById(id);
        
        if (!note) throw new Error('Scroll not found');
        if (note.user_id !== userId) throw new Error('Access denied');

        // 2. Видалення
        return await stickyNoteDAO.delete(id);
    }
}

module.exports = new StickyNoteService();