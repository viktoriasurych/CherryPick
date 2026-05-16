const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(__dirname, 'uploads'); 

async function optimizeOldImages() {
    console.log("стиснення старих картинок...\n");
    
    const files = fs.readdirSync(uploadsDir);

    for (const file of files) {
        const filePath = path.join(uploadsDir, file);

        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        try {
            // Читаємо стару важку картинку і стискаємо її
            const buffer = await sharp(filePath)
                .resize({ width: 1200, withoutEnlargement: true })
                .jpeg({ quality: 80, force: false })
                .png({ quality: 80, force: false })
                .toBuffer();

            fs.writeFileSync(filePath, buffer);
            console.log(`Готово: ${file} став легеньким!`);
        } catch (err) {
            console.log(`Пропускаю ${file} (можливо, не картинка)`);
        }
    }
    console.log("\nУСІ СТАРІ КАРТИНКИ СТИСНУТО!");
}

optimizeOldImages();