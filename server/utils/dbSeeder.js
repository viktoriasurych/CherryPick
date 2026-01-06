const fs = require('fs');
const path = require('path');
let bcrypt;
try { bcrypt = require('bcrypt'); } catch (e) { bcrypt = require('bcryptjs'); }

const dictionaries = require('../data/dictionaries.json');
const quotes = require('../data/quotes.json');
const dummyUsers = require('../data/dummyUsers.json');
const dummyCollections = require('../data/dummyCollections.json');
const dummyMe = require('../data/dummyMe.json');

const SOURCE_DIR = path.join(__dirname, '../data/seed_images');
const DEST_DIR = path.join(__dirname, '../uploads');

const seedData = (db) => {

    const copyImages = () => {
        if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
        if (fs.existsSync(SOURCE_DIR)) {
            const files = fs.readdirSync(SOURCE_DIR);
            files.forEach(file => {
                const srcPath = path.join(SOURCE_DIR, file);
                const destPath = path.join(DEST_DIR, file);
                if (!fs.existsSync(destPath)) fs.copyFileSync(srcPath, destPath);
            });
        }
    };

    const seedQuotes = () => {
        return new Promise((resolve) => {
            console.log('💬 Seeding Quotes...');
            db.get("SELECT count(*) as count FROM cat_quotes", (err, row) => {
                if (!err && row.count === 0) {
                    db.serialize(() => {
                        const stmt = db.prepare("INSERT INTO cat_quotes (content) VALUES (?)");
                        quotes.forEach(q => {
                            const text = typeof q === 'string' ? q : q.content;
                            stmt.run(text);
                        });
                        stmt.finalize(() => resolve());
                    });
                } else {
                    resolve();
                }
            });
        });
    };

    const seedDictionaries = () => {
        return new Promise((resolve) => {
            console.log('✨ Seeding Dictionaries...');
            const tables = [
                { name: 'art_genres', items: dictionaries.art_genres },
                { name: 'art_styles', items: dictionaries.art_styles },
                { name: 'art_materials', items: dictionaries.art_materials }
            ];

            const promises = tables.map(table => {
                return new Promise((subResolve) => {
                    db.get(`SELECT count(*) as count FROM ${table.name}`, (err, row) => {
                        if (!err && row.count === 0) {
                            db.serialize(() => {
                                const stmt = db.prepare(`INSERT INTO ${table.name} (name, user_id) VALUES (?, NULL)`);
                                table.items.forEach(item => stmt.run(item));
                                stmt.finalize(() => subResolve());
                            });
                        } else {
                            subResolve();
                        }
                    });
                });
            });
            Promise.all(promises).then(resolve);
        });
    };

    const seedSpecificUsers = (usersArray, label) => {
        return new Promise((resolve) => {
            console.log(`🎨 Seeding ${label}...`);
            const commonPasswordHash = bcrypt.hashSync('123456', 10);
            
            const userPromises = usersArray.map(user => {
                return new Promise((resolveUser) => {
                    db.get("SELECT id FROM users WHERE email = ?", [user.email], (err, existingUser) => {
                        if (existingUser) { resolveUser(); return; }

                        const createdAt = user.created_at || new Date().toISOString();
                        const sqlUser = `INSERT INTO users (nickname, display_name, email, password_hash, bio, avatar_url, location, social_instagram, social_website, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        
                        db.run(sqlUser, [user.nickname, user.display_name, user.email, commonPasswordHash, user.bio, user.avatar_url, user.location, user.social_instagram, user.social_website, createdAt], function() {
                            const newUserId = this.lastID;
                            
                            if (user.sticky_notes) {
                                user.sticky_notes.forEach(note => db.run(`INSERT INTO sticky_notes (user_id, title, content, color) VALUES (?, ?, ?, ?)`, [newUserId, note.title, note.content, note.color]));
                            }

                            if (!user.artworks || user.artworks.length === 0) { resolveUser(); return; }

                            const artworkPromises = user.artworks.map(art => {
                                return new Promise((resolveArt) => {
                                    db.get(`SELECT id FROM art_genres WHERE name = ?`, [art.genre], (err, g) => {
                                        db.get(`SELECT id FROM art_styles WHERE name = ?`, [art.style], (err, s) => {
                                            
                                            let fakeDateStr = new Date().toISOString();
                                            const year = art.year || art.finished_year || art.started_year;
                                            if (year) {
                                                const mm = String(art.month || 1).padStart(2, '0');
                                                const dd = String(art.day || 1).padStart(2, '0');
                                                fakeDateStr = `${year}-${mm}-${dd} 12:00:00`;
                                            }

                                            db.run(`INSERT INTO artworks (title, description, image_path, status, started_year, started_month, finished_year, finished_month, finished_day, user_id, genre_id, style_id, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                            [art.title, art.description, art.image_path, art.status, art.started_year, art.started_month, art.year || art.finished_year, art.month, art.day, newUserId, g?.id || null, s?.id || null, fakeDateStr], function() {
                                                const artId = this.lastID;
                                                
                                                if (art.materials) {
                                                    art.materials.forEach(matName => {
                                                        db.get(`SELECT id FROM art_materials WHERE name = ?`, [matName], (err, matRow) => {
                                                            if (matRow) db.run(`INSERT OR IGNORE INTO artwork_materials_link (artwork_id, material_id) VALUES (?, ?)`, [artId, matRow.id]);
                                                        });
                                                    });
                                                }
                                                if (art.gallery) {
                                                    art.gallery.forEach(img => {
                                                        db.run(`INSERT INTO artwork_gallery (artwork_id, image_path, description) VALUES (?, ?, ?)`, [artId, img.image_path, img.description || '']);
                                                    });
                                                }
                                                if (art.tags) {
                                                    art.tags.forEach(t => {
                                                        db.run(`INSERT OR IGNORE INTO art_tags (name, user_id) VALUES (?, ?)`, [t, newUserId], () => {
                                                            db.get(`SELECT id FROM art_tags WHERE name = ? AND user_id = ?`, [t, newUserId], (err, row) => {
                                                                if (row) db.run(`INSERT OR IGNORE INTO artwork_tags_link (artwork_id, tag_id) VALUES (?, ?)`, [artId, row.id]);
                                                            });
                                                        });
                                                    });
                                                }
                                                if (art.sessions) {
                                                    art.sessions.forEach(sess => {
                                                        const start = new Date(sess.date || Date.now());
                                                        const end = new Date(start.getTime() + (sess.duration * 1000));
                                                        db.run(`INSERT INTO sessions (user_id, artwork_id, start_time, end_time, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
                                                        [newUserId, artId, start.toISOString(), end.toISOString(), sess.duration, start.toISOString()], function() {
                                                            if (sess.notes || sess.photo) db.run(`INSERT INTO notes (content, photo_url, session_id, added_at) VALUES (?, ?, ?, ?)`, [sess.notes || "", sess.photo || null, this.lastID, start.toISOString()]);
                                                        });
                                                    });
                                                }
                                                resolveArt();
                                            });
                                        });
                                    });
                                });
                            });
                            Promise.all(artworkPromises).then(() => resolveUser());
                        });
                    });
                });
            });
            Promise.all(userPromises).then(resolve);
        });
    };

    const seedAllCollections = () => {
        return new Promise((resolve) => {
            console.log('📚 Seeding Collections (Internal + External)...');
            
            const internalCollections = [...dummyUsers, ...dummyMe].filter(u => u.collections && u.collections.length > 0).map(u => ({
                owner_email: u.email,
                collections: u.collections
            }));

            const externalCollections = dummyCollections.map(col => ({
                owner_email: col.owner_email,
                collections: [col] 
            }));

            const allTasks = [...internalCollections, ...externalCollections];

            const collectionPromises = allTasks.map(task => {
                return new Promise((resolveTask) => {
                    db.get("SELECT id FROM users WHERE email = ?", [task.owner_email], (err, dbUser) => {
                        if (!dbUser) {
                            console.warn(`⚠️ Skipping collection for unknown user: ${task.owner_email}`);
                            resolveTask();
                            return;
                        }

                        const colInserts = task.collections.map(col => {
                            return new Promise((resolveCol) => {
                                db.get("SELECT id FROM collections WHERE title = ? AND user_id = ?", [col.title, dbUser.id], (err, existingCol) => {
                                    if (existingCol) { resolveCol(); return; }

                                    db.run(`INSERT INTO collections (user_id, title, description, type, is_public, cover_image) VALUES (?, ?, ?, ?, ?, ?)`,
                                    [dbUser.id, col.title, col.description, col.type, col.is_public, col.cover_image], function() {
                                        const colId = this.lastID;

                                        if (!col.items || col.items.length === 0) { resolveCol(); return; }

                                        const itemPromises = col.items.map((item, idx) => {
                                            return new Promise((resolveItem) => {
                                                db.get("SELECT id FROM artworks WHERE title = ? AND user_id = ?", [item.title, dbUser.id], (err, art) => {
                                                    if (art) {
                                                        db.run(`INSERT INTO collection_items (collection_id, artwork_id, sort_order, layout_type, context_description) VALUES (?, ?, ?, ?, ?)`, 
                                                        [colId, art.id, idx, item.layout || 'CENTER', item.context || null], () => resolveItem());
                                                    } else {
                                                        console.warn(`⚠️ Artwork "${item.title}" not found for collection "${col.title}" (User: ${task.owner_email})`);
                                                        resolveItem();
                                                    }
                                                });
                                            });
                                        });
                                        Promise.all(itemPromises).then(() => resolveCol());
                                    });
                                });
                            });
                        });
                        Promise.all(colInserts).then(() => resolveTask());
                    });
                });
            });

            Promise.all(collectionPromises).then(() => {
                console.log('✅ Collections seeded!');
                resolve();
            });
        });
    };

    copyImages();
    
    seedQuotes()                         
        .then(() => seedDictionaries()) 
        .then(() => seedSpecificUsers(dummyUsers, "Dummy Artists"))
        .then(() => seedSpecificUsers(dummyMe, "Victoria's Data")) 
        .then(() => seedAllCollections()) 
        .then(() => {
            console.log('ALL SEEDING COMPLETE');
        })
        .catch(err => console.error(" Seeding Error:", err));
};

module.exports = seedData;