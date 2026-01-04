const userDAO = require('../dao/userDAO');
const fs = require('fs');
const path = require('path');

class UserService {
    
    async getProfile(userId) {
        const user = await userDAO.findById(userId);
        if (!user) {
            throw new Error('Користувача не знайдено');
        }
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }

    async updateProfile(userId, data) {
        const currentUser = await userDAO.findById(userId);
        
        if (!currentUser) {
            throw new Error('Користувача не знайдено');
        }
        
        const mergedData = {
            nickname: data.nickname || currentUser.nickname,
            display_name: data.display_name || currentUser.display_name,
            bio: data.bio !== undefined ? data.bio : currentUser.bio,
            location: data.location !== undefined ? data.location : currentUser.location,
            
            contact_email: data.contact_email !== undefined ? data.contact_email : currentUser.contact_email,
            social_telegram: data.social_telegram !== undefined ? data.social_telegram : currentUser.social_telegram,
            social_instagram: data.social_instagram !== undefined ? data.social_instagram : currentUser.social_instagram,
            social_twitter: data.social_twitter !== undefined ? data.social_twitter : currentUser.social_twitter,
            social_artstation: data.social_artstation !== undefined ? data.social_artstation : currentUser.social_artstation,
            social_behance: data.social_behance !== undefined ? data.social_behance : currentUser.social_behance,
            social_website: data.social_website !== undefined ? data.social_website : currentUser.social_website,

            show_global_stats: data.show_global_stats !== undefined ? data.show_global_stats : currentUser.show_global_stats,
            show_kpi_stats: data.show_kpi_stats !== undefined ? data.show_kpi_stats : currentUser.show_kpi_stats,
            show_heatmap_stats: data.show_heatmap_stats !== undefined ? data.show_heatmap_stats : currentUser.show_heatmap_stats,
        };

        const updatedUser = await userDAO.updateProfile(userId, mergedData);
        
        const { password_hash, ...safeUser } = updatedUser;
        return safeUser;
    }

    async uploadAvatar(userId, file) {
        const currentUser = await userDAO.findById(userId);
        if (currentUser && currentUser.avatar_url) {
             this._deleteFile(currentUser.avatar_url);
        }

        if (!file) throw new Error('Файл не передано');
        const avatarUrl = `/uploads/${file.filename}`;
        await userDAO.updateAvatar(userId, avatarUrl);
        return { avatar_url: avatarUrl };
    }

    async deleteAvatar(userId) {
        const user = await userDAO.findById(userId);
        if (user && user.avatar_url) {
            this._deleteFile(user.avatar_url);
        }
        return await userDAO.deleteAvatar(userId);
    }

    _deleteFile(avatarUrl) {
        try {
            const fileName = avatarUrl.split('/').pop();
            
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`- Файл видалено: ${filePath}`);
            }
        } catch (e) {
            console.error("Помилка видалення файлу:", e);
        }
    }

    async getByNickname(nickname) {
        const user = await userDAO.findByNickname(nickname);
        if (!user) return null;
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}

module.exports = new UserService();