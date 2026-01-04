const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);

    fs.unlink(fullPath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') return;
            console.error(`- Помилка видалення файлу: ${fullPath}`, err.message);
        } else {
            console.log(`+ Файл видалено: ${filePath}`);
        }
    });
};

module.exports = { deleteFile };