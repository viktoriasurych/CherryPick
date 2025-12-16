// server/services/authService.js
const userDAO = require('../dao/userDAO');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validatePassword, validateEmail } = require('../utils/validation');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';

class AuthService {
    
    async register(nickname, email, password) {
        // --- НОВІ ПЕРЕВІРКИ ---
        
        // 1. Перевірка формату Email
        if (!validateEmail(email)) {
            throw new Error('Некоректний формат Email (має бути @)');
        }

        // 2. Перевірка складності Пароля
        if (!validatePassword(password)) {
            throw new Error('Пароль занадто легкий! Треба: 8+ символів, 1 велику літеру, 1 цифру.');
        }
        // -----------------------

        const existingUser = await userDAO.findByEmail(email);
        if (existingUser) {
            throw new Error('Цей email вже зайнятий!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userDAO.create(nickname, email, hashedPassword);
        return newUser;
    }

    // ЛОГІКА ВХОДУ
    async login(email, password) {
        // 1. Знайти юзера
        const user = await userDAO.findByEmail(email);
        if (!user) {
            throw new Error('Користувача з таким email не існує');
        }

        // 2. Порівняти паролі (те, що ввів, з тим, що в базі)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Невірний пароль');
        }

        // 3. Якщо все ок - видати Токен (Перепустку)
        // Токен діє 24 години
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

        return { token, user: { id: user.id, nickname: user.nickname, email: user.email } };
    }
}

module.exports = new AuthService();