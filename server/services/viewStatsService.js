const viewStatsDAO = require('../dao/viewStatsDAO');

class ViewStatsService {
    
    async recordView(collectionId, userId, ipAddress) {
        return await viewStatsDAO.create(collectionId, userId, ipAddress);
    }

    async getViewsCount(collectionId) {
        return await viewStatsDAO.countByCollectionId(collectionId);
    }
}

module.exports = new ViewStatsService();