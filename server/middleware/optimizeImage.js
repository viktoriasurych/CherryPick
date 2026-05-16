const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const originalPath = req.file.path;
    const newFilename = 'opt-' + req.file.filename.split('.')[0] + '.webp';
    const newPath = path.join(req.file.destination, newFilename);

    try {
        await sharp(originalPath)
            .resize({ width: 1200, withoutEnlargement: true }) 
            .webp({ quality: 80 }) 
            .toFile(newPath);

        fs.unlinkSync(originalPath);

        req.file.filename = newFilename;
        req.file.path = newPath;
        req.file.mimetype = 'image/webp';

        next(); 
    } catch (error) {
        console.error("Помилка стиснення Sharp:", error);
        next(); 
    }
};

module.exports = optimizeImage;