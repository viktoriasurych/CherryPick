// server/utils/fileUtils.js
const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if (!filePath) return;

    // Шлях у базі виглядає як: 'uploads/image.jpg'
    // Нам треба повний шлях на комп'ютері: 'D:/project/server/uploads/image.jpg'
    
    // __dirname - це папка 'server/utils'
    // '..' - виходимо на рівень вище в 'server'
    // потім додаємо filePath
    const fullPath = path.join(__dirname, '..', filePath);

    fs.unlink(fullPath, (err) => {
        if (err) {
            // Якщо файлу вже немає (минулого разу видалили), то ок, ігноруємо
            if (err.code === 'ENOENT') return;
            console.error(`❌ Помилка видалення файлу: ${fullPath}`, err.message);
        } else {
            console.log(`🗑️ Файл видалено: ${filePath}`);
        }
    });
};

module.exports = { deleteFile };