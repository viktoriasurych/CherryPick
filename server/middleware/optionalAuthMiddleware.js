const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'fallback_secret';

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }

        const token = authHeader.split(' ')[1]; 
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();

    } catch (e) {
        next();
    }
};