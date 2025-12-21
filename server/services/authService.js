const userDAO = require('../dao/userDAO');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('./emailService'); // Не забудь про цей сервіс
const { validatePassword } = require('../utils/validation');
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    
    // --- ЗВИЧАЙНА РЕЄСТРАЦІЯ ---
    async register(nickname, email, password) {
        const existingUser = await userDAO.findByEmail(email);
        if (existingUser) throw new Error('Цей email вже зайнятий!');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userDAO.create(nickname, email, hashedPassword);

        const token = this.generateToken(newUser);
        return { token, user: newUser };
    }

    // --- ЗВИЧАЙНИЙ ВХІД ---
    async login(email, password) {
        const user = await userDAO.findByEmail(email);
        if (!user) throw new Error('Користувача з таким email не існує');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Невірний пароль');

        const token = this.generateToken(user);
        return { token, user: { id: user.id, nickname: user.nickname, email: user.email } };
    }

    // --- GOOGLE LOGIN ---
    async googleLogin(googleToken) {
        // 1. Валідація токена через Google
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        // 👇 ЗМІНА 1: Ми більше не беремо 'picture' звідси
        const { email, name, sub: googleId } = ticket.getPayload();

        // 2. Пошук або створення юзера
        let user = await userDAO.findByEmail(email);

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hash = await bcrypt.hash(randomPassword, 10);
            
            try {
                // 👇 ЗМІНА 2: Замість 'picture' передаємо null
                // Тепер база даних запише NULL, і фронтенд покаже дефолтну картинку
                user = await userDAO.createFromGoogle(name, email, hash, googleId, null);
            } catch (err) {
                if (err.message.includes('nickname') || err.message.includes('UNIQUE')) {
                    const uniqueNick = name.replace(/\s/g, '') + Math.floor(Math.random() * 1000);
                    // 👇 ТУТ ТЕЖ передаємо null
                    user = await userDAO.createFromGoogle(uniqueNick, email, hash, googleId, null);
                } else {
                    throw err;
                }
            }
        } else {
            if (!user.google_id) {
                await userDAO.linkGoogleId(user.id, googleId);
                user.google_id = googleId;
            }
        }

        const token = this.generateToken(user);
        return { token, user };
    }

    // --- ЗАБУЛИ ПАРОЛЬ (Forgot Password) ---
    async forgotPassword(email) {
        const user = await userDAO.findByEmail(email);
        if (!user) {
            // З міркувань безпеки не кажемо, що юзера немає, але і нічого не робимо
            return "Інструкції надіслано (якщо email існує)"; 
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 година

        // Зберігаємо токен через DAO
        await userDAO.saveResetToken(email, token, expiresAt);

        // Відправляємо лист
        const sent = await emailService.sendResetEmail(email, token);
        if (!sent) throw new Error("Помилка відправки email");
        
        return "Інструкції надіслано на пошту";
    }

    // --- ЗМІНА ПАРОЛЮ (Reset Password) ---
    async resetPassword(email, token, newPassword) {
        
        // 👇 2. ДОДАЄМО ПЕРЕВІРКУ ТУТ
        if (!validatePassword(newPassword)) {
            throw new Error("Пароль має містити мінімум 8 символів, 1 велику літеру та 1 цифру!");
        }

        const record = await userDAO.findResetToken(email, token);
        if (!record) throw new Error("Невірний або прострочений токен");

        const now = new Date();
        const expires = new Date(record.expires_at);
        if (now > expires) throw new Error("Токен прострочений");

        const newHash = await bcrypt.hash(newPassword, 10);
        
        await userDAO.updatePassword(email, newHash);
        await userDAO.deleteResetToken(email);

        return "Пароль успішно змінено";
    }

    // Helper
    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();