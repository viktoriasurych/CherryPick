import api from '../api/axios';

class UserService {
    
    async getProfile() {
        const { data } = await api.get('/users/me');
        return data;
    }

    async updateProfile(userData) {
        const { data } = await api.put('/users/me', userData);
        return data;
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const { data } = await api.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }

    async deleteAvatar() {
        const { data } = await api.delete('/users/me/avatar');
        return data;
    }
}

export default new UserService();