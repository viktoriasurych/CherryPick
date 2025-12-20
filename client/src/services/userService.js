import api from '../api/axios';

class UserService {
    
    // Отримати профіль (якщо треба оновити дані вручну)
    async getProfile() {
        const { data } = await api.get('/users/me');
        return data;
    }

    // Оновити текстові дані (Нік, біо, соцмережі)
    async updateProfile(userData) {
        const { data } = await api.put('/users/me', userData);
        return data;
    }

    // Завантажити аватар
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const { data } = await api.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }

    // Видалити аватар
    async deleteAvatar() {
        const { data } = await api.delete('/users/me/avatar');
        return data;
    }
}

export default new UserService();