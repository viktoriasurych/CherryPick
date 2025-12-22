const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const userDAO = require('../dao/userDAO');
const emailService = require('./emailService'); 
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

    // --- ЗВИЧАЙНИЙ ВХІД (Виправлено помилку) ---
    async login(email, password) {
        const user = await userDAO.findByEmail(email);
        if (!user) throw new Error('Користувача з таким email не існує');

        // 👇 ВИПРАВЛЕННЯ ПОМИЛКИ "Illegal arguments"
        // Якщо у юзера немає хеша пароля, значить він реєструвався через Google
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

    // --- GOOGLE LOGIN (Без фото) ---
    async googleLogin(googleToken) {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        // picture нам приходить, але ми його ІГНОРУЄМО
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
                    null,               // 👈 ТУТ ЗМІНА: null замість picture (буде без фото)
                    name                
                );
            }
        }

        const token = this.generateToken(user);
        return { token, user };
    }

    // --- ЗАБУЛИ ПАРОЛЬ ---
    async forgotPassword(email) {
        const user = await userDAO.findByEmail(email);
        if (!user) {
            return "Інструкції надіслано (якщо email існує)"; 
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); 

        await userDAO.saveResetToken(email, token, expiresAt);

        const sent = await emailService.sendResetEmail(email, token);
        if (!sent) throw new Error("Помилка відправки email");
        
        return "Інструкції надіслано на пошту";
    }

    // --- ЗМІНА ПАРОЛЮ ---
    async resetPassword(email, token, newPassword) {
        if (!validatePassword(newPassword)) {
            throw new Error("Пароль має містити мінімум 8 символів, 1 велику літеру та 1 цифру!");
        }

        const record = await userDAO.findResetToken(email, token);
        if (!record) throw new Error("Невірний або прострочений токен");

        const now = new Date();
        const expires = new Date(record.expires_at);
        if (now > expires) throw new Error("Токен прострочений");

        const newHash = await bcrypt.hash(newPassword, 10);
        
        // Тут ми ставимо новий пароль. Тепер юзер з Гугла ЗМОЖЕ заходити і через пароль!
        await userDAO.updatePassword(email, newHash);
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