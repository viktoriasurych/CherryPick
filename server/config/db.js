const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Визначаємо шлях до файлу бази даних (у папці server)
const dbPath = path.resolve(__dirname, '../cherrypitch.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Помилка підключення до БД:', err.message);
    } else {
        console.log('✅ Підключено до SQLite бази даних.');
    }
});

db.serialize(() => {
    // Вмикаємо підтримку зовнішніх ключів (Foreign Keys)
    db.run("PRAGMA foreign_keys = ON");

    /* =========================================
       1. КОРИСТУВАЧІ (User)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    /* =========================================
       2. ДОВІДНИКИ (Dictionaries)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS art_styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS art_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS art_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )`);

    /* =========================================
       3. КАРТИНИ (Artwork)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_path TEXT, -- Шлях до головного фото (обкладинки)
        
        -- Статус (Enum з діаграми)
        status TEXT DEFAULT 'PLANNED' CHECK( status IN ('PLANNED', 'SKETCH', 'IN_PROGRESS', 'FINISHED', 'ON_HOLD', 'DROPPED') ),
        
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Зв'язки
        user_id INTEGER NOT NULL,
        style_id INTEGER,
        material_id INTEGER,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (style_id) REFERENCES art_styles(id),
        FOREIGN KEY (material_id) REFERENCES art_materials(id)
    )`);

    /* =========================================
       4. КОЛЕКЦІЇ (Collection)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Таблиця зв'язку (Багато-до-Багатьох): Колекція <-> Картина
    db.run(`CREATE TABLE IF NOT EXISTS collection_items (
        collection_id INTEGER,
        artwork_id INTEGER,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )`);

    /* =========================================
       5. СЕАНСИ МАЛЮВАННЯ (DrawingSession)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time DATETIME,
        end_time DATETIME,
        duration_seconds INTEGER DEFAULT 0,
        is_paused BOOLEAN DEFAULT 0,
        artwork_id INTEGER NOT NULL,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )`);

    /* =========================================
       6. НОТАТКИ ТА ПРОГРЕС (Note)
       ========================================= */
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        photo_url TEXT, -- Сюди будуть падати фото прогресу
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )`);

    /* =========================================
       7. ПОЧАТКОВЕ ЗАПОВНЕННЯ (Seed Data)
       ========================================= */
    // Додаємо стилі, якщо їх немає
    db.get("SELECT count(*) as count FROM art_styles", (err, row) => {
        if (row && row.count === 0) {
            console.log('🎨 Додаємо базові стилі...');
            const styles = ['Realism', 'Anime', 'Pixel Art', 'Abstract', 'Gothic', 'Sketch', 'Pop Art', 'Cyberpunk'];
            const stmt = db.prepare("INSERT INTO art_styles (name) VALUES (?)");
            styles.forEach(style => stmt.run(style));
            stmt.finalize();
        }
    });

    // Додаємо матеріали, якщо їх немає
    db.get("SELECT count(*) as count FROM art_materials", (err, row) => {
        if (row && row.count === 0) {
            console.log('🖌 Додаємо базові матеріали...');
            const materials = ['Oil', 'Watercolor', 'Digital (Procreate)', 'Digital (Photoshop)', 'Pencil', 'Acrylic', 'Ink', 'Charcoal'];
            const stmt = db.prepare("INSERT INTO art_materials (name) VALUES (?)");
            materials.forEach(mat => stmt.run(mat));
            stmt.finalize();
        }
    });
});

module.exports = db;