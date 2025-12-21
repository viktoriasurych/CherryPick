const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        // 👇 ЗМІНА ТУТ: Використовуємо явні налаштування для порту 587
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',  // Сервер Gmail
            port: 587,               // Порт TLS (рідше блокується)
            secure: false,           // false для 587, true для 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Дозволяє працювати навіть через суворі проксі
            }
        });
    }

    async sendResetEmail(toEmail, token) {
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${toEmail}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
                    <h1 style="color: #e11d48; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">🍒 CherryPick</h1>
                </div>
                
                <div style="padding: 30px 0; text-align: center;">
                    <h2 style="color: #fff; margin-bottom: 20px;">Відновлення паролю</h2>
                    <p style="color: #94a3b8; margin-bottom: 30px; font-size: 16px;">
                        Ми отримали запит на зміну паролю для вашого акаунту. <br/>
                        Якщо це були ви, натисніть кнопку нижче:
                    </p>
                    
                    <a href="${resetLink}" style="background-color: #e11d48; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Змінити пароль
                    </a>

                    <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
                        Або скопіюйте це посилання в браузер:<br/>
                        <a href="${resetLink}" style="color: #e11d48;">${resetLink}</a>
                    </p>
                </div>

                <div style="border-top: 1px solid #334155; padding-top: 20px; text-align: center; font-size: 12px; color: #475569;">
                    <p>Це посилання дійсне протягом 1 години.</p>
                    <p>Якщо ви не робили цей запит, просто проігноруйте цей лист.</p>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"CherryPick Security" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: '🍒 Відновлення доступу до CherryPick',
                html: htmlContent
            });

            console.log(`✅ Email успішно відправлено на: ${toEmail}`);
            return true;
        } catch (error) {
            console.error("❌ Помилка відправки email:", error);
            return false;
        }
    }
}

module.exports = new EmailService();