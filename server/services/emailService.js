const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',  
            port: 587,              
            secure: false,          
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false 
            }
        });
    }

    async sendResetEmail(toEmail, token) {
        // Посилання на фронтенд
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${toEmail}`;

        // 👇 НОВИЙ GOTHIC / DARK ACADEMIA ДИЗАЙН
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Скидання стилів для поштовиків */
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { -ms-interpolation-mode: bicubic; }
                    
                    /* Основні стилі */
                    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #050505; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #050505;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #121212; border: 1px solid #333333;">
                                
                                <tr>
                                    <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid #333333;">
                                        <h1 style="font-family: 'Courier New', Courier, monospace; color: #9f1239; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 4px;">
                                            CherryPick 🍒
                                        </h1>
                                        <p style="font-family: 'Courier New', Courier, monospace; color: #555555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                                            Archive Access Protocol
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="center" style="padding: 40px 30px;">
                                        <h2 style="font-family: 'Courier New', Courier, monospace; color: #e5e5e5; font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">
                                            Access Recovery
                                        </h2>
                                        
                                        <p style="font-family: 'Courier New', Courier, monospace; color: #a3a3a3; font-size: 14px; line-height: 24px; margin-bottom: 30px;">
                                            We received a signal to break the seal on your archive. <br>
                                            If you wish to forge a new password, use the key below.
                                        </p>

                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 2px;" bgcolor="#9f1239">
                                                    <a href="${resetLink}" target="_blank" style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 15px 30px; border: 1px solid #9f1239; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                                                        Reset Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="font-family: 'Courier New', Courier, monospace; color: #555555; font-size: 12px; margin-top: 40px;">
                                            Or verify this link manually:
                                        </p>
                                        <a href="${resetLink}" style="font-family: 'Courier New', Courier, monospace; color: #9f1239; font-size: 11px; word-break: break-all;">
                                            ${resetLink}
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #0a0a0a; border-top: 1px solid #333333;">
                                        <p style="font-family: 'Courier New', Courier, monospace; color: #444444; font-size: 10px; line-height: 14px; text-transform: uppercase;">
                                            This scroll expires in 1 hour. <br>
                                            If you did not summon this, let it burn in the void.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"CherryPick Archives" <${process.env.EMAIL_USER}>`, // Змінив ім'я відправника
                to: toEmail,
                subject: '🍒 CherryPick | Password Reset Scroll', // Змінив тему
                html: htmlContent
            });

            console.log(`✅ Email sent to: ${toEmail}`);
            return true;
        } catch (error) {
            console.error("❌ Email sending failed:", error);
            return false;
        }
    }
}

module.exports = new EmailService();