const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const RULES = require('./validationRules.json');

const dbPath = path.resolve(__dirname, '../cherrypitch.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Помилка підключення до БД:', err.message);
    else console.log('✅ Підключено до SQLite бази даних.');
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    // 1. USERS
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT UNIQUE CHECK(length(nickname) <= ${RULES.USER.NICKNAME.MAX}),
        display_name TEXT CHECK(length(display_name) <= ${RULES.USER.DISPLAY_NAME.MAX}),
        email TEXT UNIQUE NOT NULL CHECK(length(email) <= ${RULES.USER.EMAIL.MAX}),
        password_hash TEXT, 
        google_id TEXT UNIQUE, 
        avatar_url TEXT,
        bio TEXT CHECK(length(bio) <= ${RULES.USER.BIO.MAX}),
        location TEXT CHECK(length(location) <= ${RULES.USER.LOCATION.MAX}),
        contact_email TEXT CHECK(length(contact_email) <= ${RULES.USER.EMAIL.MAX}),
        social_telegram TEXT CHECK(length(social_telegram) <= ${RULES.USER.SOCIAL.MAX}),
        social_instagram TEXT CHECK(length(social_instagram) <= ${RULES.USER.SOCIAL.MAX}),
        social_twitter TEXT CHECK(length(social_twitter) <= ${RULES.USER.SOCIAL.MAX}),
        social_artstation TEXT CHECK(length(social_artstation) <= ${RULES.USER.SOCIAL.MAX}),
        social_behance TEXT CHECK(length(social_behance) <= ${RULES.USER.SOCIAL.MAX}),
        social_website TEXT CHECK(length(social_website) <= ${RULES.USER.SOCIAL.MAX}),
        show_global_stats BOOLEAN DEFAULT 1, 
        show_kpi_stats BOOLEAN DEFAULT 1,    
        show_heatmap_stats BOOLEAN DEFAULT 1, 

        created_at DATETIME DEFAULT (datetime('now', 'localtime')) -- 🇺🇦 Локальний час
    )`);

    // 1.1. PASSWORD RESETS
    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')) -- 🇺🇦
    )`);

    // 2. DICTIONARIES
    const createDictTable = (tableName) => {
        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL CHECK(length(name) <= ${RULES.DICT.NAME.MAX}),
            user_id INTEGER, 
            UNIQUE(name, user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    };
    createDictTable('art_styles');
    createDictTable('art_materials');
    createDictTable('art_genres');
    createDictTable('art_tags');

    // 3. ARTWORKS
    db.run(`CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) <= ${RULES.ARTWORK.TITLE.MAX}),
        description TEXT CHECK(length(description) <= ${RULES.ARTWORK.DESCRIPTION.MAX}),
        image_path TEXT,
        status TEXT DEFAULT 'PLANNED',
        
        created_date DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        
        started_year INTEGER, started_month INTEGER, started_day INTEGER,
        finished_year INTEGER, finished_month INTEGER, finished_day INTEGER,
        user_id INTEGER NOT NULL, style_id INTEGER, genre_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (style_id) REFERENCES art_styles(id) ON DELETE SET NULL, 
        FOREIGN KEY (genre_id) REFERENCES art_genres(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artwork_tags_link (
        artwork_id INTEGER, tag_id INTEGER, PRIMARY KEY (artwork_id, tag_id),
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES art_tags(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artwork_materials_link (
        artwork_id INTEGER, material_id INTEGER, PRIMARY KEY (artwork_id, material_id),
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES art_materials(id) ON DELETE CASCADE
    )`);

    // 4. COLLECTIONS
    db.run(`CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL CHECK(length(title) <= ${RULES.COLLECTION.TITLE.MAX}),
        description TEXT CHECK(length(description) <= ${RULES.COLLECTION.DESCRIPTION.MAX}),
        type TEXT NOT NULL CHECK(type IN ('MOODBOARD', 'SERIES', 'EXHIBITION')) DEFAULT 'MOODBOARD',
        is_public BOOLEAN DEFAULT 0,
        cover_image TEXT,
        sort_order INTEGER DEFAULT 0, 
        created_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        artwork_id INTEGER NOT NULL,
        sort_order INTEGER DEFAULT 0,
        layout_type TEXT DEFAULT 'CENTER',
        context_description TEXT CHECK(length(context_description) <= ${RULES.COLLECTION.CONTEXT_DESC.MAX}),
        created_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY(artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        UNIQUE(collection_id, artwork_id)
    )`);

    // 5. SESSIONS
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artwork_id INTEGER NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        duration_seconds INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 5.1. VIEW COUNTER
    db.run(`CREATE TABLE IF NOT EXISTS collection_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        user_id INTEGER,
        ip_address TEXT NOT NULL, 
        viewed_at TEXT DEFAULT CURRENT_DATE, -- Тут можна лишити DATE, бо це просто день
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(collection_id, user_id, viewed_at),
        UNIQUE(collection_id, ip_address, viewed_at)
    )`);

    // 6. NOTES
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT CHECK(length(content) <= ${RULES.NOTE.CONTENT.MAX}),
        photo_url TEXT,
        added_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        session_id INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )`);

    // 7. ARTWORK GALLERY
    db.run(`CREATE TABLE IF NOT EXISTS artwork_gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artwork_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        description TEXT CHECK(length(description) <= ${RULES.ARTWORK.DESCRIPTION.MAX}),
        created_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )`);

    // 8. SAVED COLLECTIONS
    db.run(`CREATE TABLE IF NOT EXISTS saved_collections (
        user_id INTEGER NOT NULL,
        collection_id INTEGER NOT NULL,
        saved_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        PRIMARY KEY (user_id, collection_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )`);

    // 10. STICKY NOTES
    db.run(`CREATE TABLE IF NOT EXISTS sticky_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT CHECK(length(title) <= ${RULES.STICKY_NOTE.TITLE.MAX}),
        content TEXT CHECK(length(content) <= ${RULES.STICKY_NOTE.CONTENT.MAX}),
        color TEXT DEFAULT 'yellow', 
        updated_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        created_at DATETIME DEFAULT (datetime('now', 'localtime')), -- 🇺🇦
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 9. SEEDING
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
    seedDict('art_genres', ['Portrait', 'Landscape', 'Still Life', 'Character Design', 'Concept Art']);
});

module.exports = db;