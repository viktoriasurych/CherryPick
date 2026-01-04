const stickyNoteDAO = require('../dao/stickyNoteDAO');

class StickyNoteService {
    
    async getAll(userId) {
        return await stickyNoteDAO.getAll(userId);
    }

    async create(userId, data) {
        const title = data.title || 'New Scroll';
        const content = data.content || '';
        const color = data.color || 'pink';
        
        return await stickyNoteDAO.create(userId, { title, content, color });
    }

    async update(id, userId, data) {
        const note = await stickyNoteDAO.findById(id);
        
        if (!note) throw new Error('Scroll not found');
        if (note.user_id !== userId) throw new Error('Access denied');

        return await stickyNoteDAO.update(id, data);
    }

    async delete(id, userId) {
        const note = await stickyNoteDAO.findById(id);
        
        if (!note) throw new Error('Scroll not found');
        if (note.user_id !== userId) throw new Error('Access denied');

        return await stickyNoteDAO.delete(id);
    }
}

module.exports = new StickyNoteService();