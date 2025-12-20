const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../cherrypitch.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Помилка підключення до БД:', err.message);
    else console.log('✅ Підключено до SQLite бази даних.');
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

// 1. КОРИСТУВАЧІ (ОНОВЛЕНО: nickname UNIQUE)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT UNIQUE,       -- 👈 ТЕПЕР ВОНИ НЕ МОЖУТЬ ПОВТОРЮВАТИСЬ
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    
    contact_email TEXT,
    social_telegram TEXT,
    social_instagram TEXT,
    social_twitter TEXT,
    social_artstation TEXT,
    social_behance TEXT,
    social_website TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// ...
    // 2. ДОВІДНИКИ (З підтримкою особистих записів)
    // user_id NULL = Загальне для всіх
    // user_id NOT NULL = Особисте
    const createDictTable = (tableName) => {
        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            user_id INTEGER, 
            UNIQUE(name, user_id), -- Щоб не дублювали назви для одного юзера
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    };

    createDictTable('art_styles');
    createDictTable('art_materials');
    createDictTable('art_genres'); // <--- НОВЕ: Жанри
    createDictTable('art_tags');

    // 3. КАРТИНИ
    db.run(`CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_path TEXT,
        status TEXT DEFAULT 'PLANNED',
        
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP, -- Системна дата
        
        -- 👇 ГНУЧКІ ДАТИ (Початок)
        started_year INTEGER,
        started_month INTEGER,
        started_day INTEGER,

        -- 👇 ГНУЧКІ ДАТИ (Кінець)
        finished_year INTEGER,
        finished_month INTEGER,
        finished_day INTEGER,
        
        user_id INTEGER NOT NULL,
        style_id INTEGER, 
        genre_id INTEGER,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (style_id) REFERENCES art_styles(id) ON DELETE SET NULL, 
        FOREIGN KEY (genre_id) REFERENCES art_genres(id) ON DELETE SET NULL
    )`);


    // 3.1. ЗВ'ЯЗОК КАРТИНА <-> ТЕГИ (Багато до багатьох)
    db.run(`CREATE TABLE IF NOT EXISTS artwork_tags_link (
        artwork_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (artwork_id, tag_id),
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES art_tags(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artwork_materials_link (
        artwork_id INTEGER,
        material_id INTEGER,
        PRIMARY KEY (artwork_id, material_id),
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES art_materials(id) ON DELETE CASCADE
    )`);

  // 4. КОЛЕКЦІЇ (ОНОВЛЕНО: Додано is_public)
  db.run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('MOODBOARD', 'SERIES', 'EXHIBITION')) DEFAULT 'MOODBOARD',
    
    is_public BOOLEAN DEFAULT 0, -- 👈 НОВЕ ПОЛЕ (0 = Приватна, 1 = Публічна)
    
    cover_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)`);

db.run(`CREATE TABLE IF NOT EXISTS collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    artwork_id INTEGER NOT NULL,
    
    -- 👇 Для порядку (Важливо для "Серії" та "Виставки")
    sort_order INTEGER DEFAULT 0,
    
    -- 👇 Для "Виставки" (CENTER, LEFT_TEXT, RIGHT_TEXT)
    layout_type TEXT DEFAULT 'CENTER',
    
    -- 👇 Унікальний опис картини саме для цієї збірки
    context_description TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY(artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
    
    -- Щоб одну картину не додали двічі в ту саму збірку
    UNIQUE(collection_id, artwork_id)
)`);

    // 5. СЕСІЇ
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time DATETIME,
        end_time DATETIME,
        duration_seconds INTEGER DEFAULT 0,
        is_paused BOOLEAN DEFAULT 0,
        artwork_id INTEGER NOT NULL,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )`);

    // 6. НОТАТКИ
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        photo_url TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artwork_gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artwork_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )`);

    // 7. ПОЧАТКОВЕ ЗАПОВНЕННЯ (Global Data)
    const seedDict = (table, items) => {
        db.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
            if (row && row.count === 0) {
                console.log(`✨ Заповнюємо ${table}...`);
                const stmt = db.prepare(`INSERT INTO ${table} (name, user_id) VALUES (?, NULL)`);
                items.forEach(item => stmt.run(item));
                stmt.finalize();
            }
        });
    };

    seedDict('art_styles', ['Realism', 'Anime', 'Pixel Art', 'Abstract', 'Gothic', 'Sketch']);
    seedDict('art_materials', ['Oil', 'Watercolor', 'Digital', 'Pencil', 'Acrylic', 'Ink']);
    seedDict('art_genres', ['Portrait', 'Landscape', 'Still Life', 'Character Design', 'Concept Art']); // <--- Жанри
});

module.exports = db;