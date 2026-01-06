const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const userDAO = require('../dao/userDAO');
const emailService = require('./emailService');
const { validatePassword } = require('../utils/validation'); 
const { generateNickname } = require('../utils/helpers');    
const axios = require('axios')

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    
    async register(nickname, email, password) {
        const existingUser = await userDAO.findByEmail(email);
        if (existingUser) throw new Error('This email is already taken!');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userDAO.create(nickname, email, hashedPassword, nickname);

        const token = this.generateToken(newUser);
        return { token, user: newUser };
    }

    async login(email, password) {
        const user = await userDAO.findByEmail(email);
        if (!user) throw new Error('User with this email does not exist');

        if (!user.password_hash) {
            throw new Error('This account was created via Google. Please sign in with Google or use password recovery.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Invalid password');

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

    async googleLogin(googleToken) {
        let payload;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (error) {
            try {
                const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                    headers: { Authorization: `Bearer ${googleToken}` }
                });
                payload = {
                    email: response.data.email,
                    name: response.data.name,
                    sub: response.data.sub,
                    picture: response.data.picture
                };
            } catch (axiosError) {
                console.error("Google Token Verification Failed:", axiosError.message);
                throw new Error('Invalid Google token');
            }
        }

        const { email, name, sub: googleId } = payload;

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
                    null,
                    googleId, 
                    null, 
                    name
                );
            }
        }

        const token = this.generateToken(user);
        return { 
            token, 
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                display_name: user.display_name,
                avatar_url: user.avatar_url
            } 
        };
    }

    async forgotPassword(email) {
        const user = await userDAO.findByEmail(email);
        
        if (!user) {
            return "Instructions sent (if email exists)"; 
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); 
        await userDAO.saveResetToken(email, token, expiresAt);
        const sent = await emailService.sendResetEmail(email, token);
        
        if (!sent) {
            throw new Error("Error sending email via service");
        }
        
        return "Instructions sent to email";
    }

    async resetPassword(email, token, newPassword) {

        const record = await userDAO.findResetToken(email, token);
        if (!record) throw new Error("Invalid or expired token");

        const now = new Date();
        const expires = new Date(record.expires_at);
        if (now > expires) throw new Error("Link expired");

        const newHash = await bcrypt.hash(newPassword, 10);
        
        await userDAO.updatePassword(email, newHash);
        
        await userDAO.deleteResetToken(email);

        return "Password successfully changed";
    }

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