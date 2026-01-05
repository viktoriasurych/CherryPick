const dictionaries = require('../data/dictionaries.json');
const quotes = require('../data/quotes.json');

const seedData = (db) => {
    
    const seedDictTable = (tableName, items) => {
        db.get(`SELECT count(*) as count FROM ${tableName}`, (err, row) => {
            if (err) {
                console.error(`❌ Error checking ${tableName}:`, err.message);
                return;
            }
            
            if (row && row.count === 0) {
                console.log(`✨ Seeding ${tableName}...`);
                
                const stmt = db.prepare(`INSERT INTO ${tableName} (name, user_id) VALUES (?, NULL)`);
                
                items.forEach(item => {
                    stmt.run(item, (err) => {
                        if (err) console.error(`   ⚠️ Failed to insert "${item}" into ${tableName}:`, err.message);
                    });
                });
                
                stmt.finalize();
            }
        });
    };

    const seedQuotesTable = () => {
        db.get(`SELECT count(*) as count FROM cat_quotes`, (err, row) => {
            if (err) {
                console.error(`❌ Error checking cat_quotes:`, err.message);
                return;
            }

            if (row && row.count === 0) {
                console.log(`🐈 Seeding Cat Oracle...`);
                
                const stmt = db.prepare(`INSERT INTO cat_quotes (content) VALUES (?)`);
                
                quotes.forEach(quote => {
                    stmt.run(quote, (err) => {
                        if (err) console.error(`   ⚠️ Failed to insert quote:`, err.message);
                    });
                });
                
                stmt.finalize();
            }
        });
    };

    seedDictTable('art_genres', dictionaries.art_genres);
    seedDictTable('art_styles', dictionaries.art_styles);
    seedDictTable('art_materials', dictionaries.art_materials);
    
    seedQuotesTable();
};

module.exports = seedData;