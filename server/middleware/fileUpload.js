// server/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Щоб уникнути кирилиці в назвах, яка ламає шляхи, робимо так:
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // 👇 ДЕТАЛЬНИЙ ЛОГ
    console.log("------------------------------------------------");
    console.log("📸 Multer побачив файл!");
    console.log("Назва:", file.originalname);
    console.log("Mimetype:", file.mimetype);
    console.log("------------------------------------------------");

    // ТИМЧАСОВО ДОЗВОЛЯЄМО ВСЕ (Щоб перевірити, чи працює завантаження)
    cb(null, true); 
    
    // Старий код перевірки (поки закоментуй):
    // if (file.mimetype.startsWith('image/')) {
    //     cb(null, true);
    // } else {
    //     console.log("❌ Файл відхилено (не картинка)");
    //     cb(null, false);
    // }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }// 10MB
});

module.exports = upload;