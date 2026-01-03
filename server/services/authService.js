const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Вбудована бібліотека для генерації токенів
const { OAuth2Client } = require('google-auth-library');

const userDAO = require('../dao/userDAO');
const emailService = require('./emailService'); // 👇 ПІДКЛЮЧАЄМО НАШ НОВИЙ СЕРВІС
const { validatePassword } = require('../utils/validation'); 
const { generateNickname } = require('../utils/helpers');   

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    
    // --- ЗВИЧАЙНА РЕЄСТРАЦІЯ ---
    async register(nickname, email, password) {
        const existingUser = await userDAO.findByEmail(email);
        if (existingUser) throw new Error('Цей email вже зайнятий!');

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // nickname передаємо і як нік, і як відображуване ім'я
        const newUser = await userDAO.create(nickname, email, hashedPassword, nickname);

        const token = this.generateToken(newUser);
        return { token, user: newUser };
    }

    // --- ЗВИЧАЙНИЙ ВХІД ---
    async login(email, password) {
        const user = await userDAO.findByEmail(email);
        if (!user) throw new Error('Користувача з таким email не існує');

        if (!user.password_hash) {
            throw new Error('Цей акаунт створено через Google. Увійдіть через Google або скористайтеся відновленням паролю.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Невірний пароль');

        const token = this.generateToken(user);
        return { 
            token, 
            user: { 
                id: user.id, 
                nickname: user.nickname, 
                email: user.email, 
                avatar_url: user.avatar_url 
            } 
        };
    }

    // --- GOOGLE LOGIN ---
    async googleLogin(googleToken) {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await userDAO.findByGoogleId(googleId);

        if (!user) {
            const existingUserByEmail = await userDAO.findByEmail(email);

            if (existingUserByEmail) {
                await userDAO.linkGoogleId(existingUserByEmail.id, googleId);
                user = existingUserByEmail;
            } else {
                const newNickname = generateNickname(name); 

                user = await userDAO.createFromGoogle(
                    newNickname,        
                    email, 
                    null,               // Пароля немає
                    googleId, 
                    null,               // avatar_url (ігноруємо фото Google, як ти хотів)
                    name                // display_name
                );
            }
        }

        const token = this.generateToken(user);
        return { token, user };
    }

    // 👇 --- ВИПРАВЛЕНИЙ МЕТОД: ЗАБУЛИ ПАРОЛЬ ---
    async forgotPassword(email) {
        // 1. Перевіряємо, чи є юзер
        const user = await userDAO.findByEmail(email);
        
        // Якщо юзера немає, ми НЕ кажемо "немає", щоб хакери не перевіряли базу.
        // Ми просто повертаємо успіх (фейковий).
        if (!user) {
            return "Інструкції надіслано (якщо email існує)"; 
        }

        // 2. Генеруємо випадковий токен (без бібліотеки uuid, стандартним crypto)
        const token = crypto.randomBytes(32).toString('hex');
        
        // 3. Час життя токена - 1 година
        // toISOString() потрібен, щоб SQLite зрозумів дату
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); 

        // 4. Зберігаємо в базу (таблиця password_resets)
        await userDAO.saveResetToken(email, token, expiresAt);

        // 5. ВІДПРАВЛЯЄМО ЛИСТ (Викликаємо наш новий EmailService)
        const sent = await emailService.sendResetEmail(email, token);
        
        if (!sent) {
            throw new Error("Помилка відправки email сервісом");
        }
        
        return "Інструкції надіслано на пошту";
    }

    // --- ЗМІНА ПАРОЛЮ ---
    async resetPassword(email, token, newPassword) {
        // Валідація складності пароля (якщо треба)
        // if (!validatePassword(newPassword)) { ... }

        // 1. Шукаємо токен в базі
        const record = await userDAO.findResetToken(email, token);
        if (!record) throw new Error("Невірний або прострочений токен");

        // 2. Перевіряємо дату
        const now = new Date();
        const expires = new Date(record.expires_at);
        if (now > expires) throw new Error("Час дії посилання вичерпано");

        // 3. Хешуємо новий пароль
        const newHash = await bcrypt.hash(newPassword, 10);
        
        // 4. Оновлюємо пароль користувача
        await userDAO.updatePassword(email, newHash);
        
        // 5. Видаляємо використаний токен
        await userDAO.deleteResetToken(email);

        return "Пароль успішно змінено";
    }

    // --- Helper ---
    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                nickname: user.nickname 
            }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();