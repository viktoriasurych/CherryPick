const db = require('../config/db');

class StatsDAO {
    getStartYear(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT MIN(COALESCE(started_year, CAST(strftime('%Y', created_date) AS INTEGER))) as min_year
                FROM artworks WHERE user_id = ?
            `;
            db.get(sql, [userId], (err, row) => {
                if (err) return reject(err);
                resolve(row?.min_year || new Date().getFullYear());
            });
        });
    }

    getTotals(userId, year = null) {
        return new Promise((resolve, reject) => {
            const params = [userId, userId, userId];
            const artYearFilter = year ? `AND started_year = ${Number(year)}` : "";
            const sessYearFilter = year ? `AND strftime('%Y', s.start_time) = '${year}'` : "";
            const colYearFilter = year ? `AND strftime('%Y', created_at) = '${year}'` : "";

            const sql = `
                SELECT 
                    (SELECT COUNT(*) FROM artworks WHERE user_id = ? ${artYearFilter}) as works_count,
                    -- 👇 ТУТ ЗМІНИ: COALESCE(SUM(...), 0)
                    (SELECT COALESCE(SUM(duration_seconds), 0) FROM sessions s JOIN artworks a ON s.artwork_id = a.id WHERE a.user_id = ? ${sessYearFilter}) as total_seconds,
                    (SELECT COUNT(*) FROM collections WHERE user_id = ? ${colYearFilter}) as collections_count
            `;

            db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row || { works_count: 0, total_seconds: 0, collections_count: 0 });
            });
        });
    }

    getDistributions(userId, year = null) {
        return new Promise((resolve, reject) => {
            const params = [userId];
            const artYearFilter = year ? ` AND started_year = ${Number(year)}` : "";
            const colYearFilter = year ? ` AND strftime('%Y', created_at) = '${year}'` : "";
            const linkYearFilter = year ? ` AND a.started_year = ${Number(year)}` : "";

            const queries = {
                status: `SELECT status, COUNT(*) as count FROM artworks WHERE user_id = ? ${artYearFilter} GROUP BY status`,
                collTypes: `SELECT type as name, COUNT(*) as count FROM collections WHERE user_id = ? ${colYearFilter} GROUP BY type`,
                genres: `SELECT COALESCE(g.name, 'Не вказано') as name, COUNT(a.id) as count FROM artworks a LEFT JOIN art_genres g ON a.genre_id = g.id WHERE a.user_id = ? ${artYearFilter} GROUP BY name`,
                styles: `SELECT COALESCE(s.name, 'Не вказано') as name, COUNT(a.id) as count FROM artworks a LEFT JOIN art_styles s ON a.style_id = s.id WHERE a.user_id = ? ${artYearFilter} GROUP BY name`,
                materials: `SELECT m.name, COUNT(*) as count FROM artwork_materials_link aml JOIN art_materials m ON aml.material_id = m.id JOIN artworks a ON aml.artwork_id = a.id WHERE a.user_id = ? ${linkYearFilter} GROUP BY m.name`,
                tags: `SELECT t.name, COUNT(*) as count FROM artwork_tags_link atl JOIN art_tags t ON atl.tag_id = t.id JOIN artworks a ON atl.artwork_id = a.id WHERE a.user_id = ? ${linkYearFilter} GROUP BY t.name`
            };

            const result = {};
            const keys = Object.keys(queries);
            let completed = 0;
            if (keys.length === 0) resolve({});

            keys.forEach(key => {
                db.all(queries[key], params, (err, rows) => {
                    if (err) { console.error(`SQL Error in ${key}:`, err); result[key] = []; } 
                    else result[key] = rows;
                    if (++completed === keys.length) resolve(result);
                });
            });
        });
    }

    getTimePatterns(userId, year = null) {
        return new Promise((resolve, reject) => {
            const params = [userId];
            const yearFilter = year ? ` AND strftime('%Y', start_time) = '${year}'` : "";

            const queries = {
                // 👇 ТУТ ЗМІНИ: Явно сумуємо числа
                days: `
                    SELECT strftime('%w', start_time) as index_val, 
                    COALESCE(SUM(duration_seconds), 0) as total_seconds
                    FROM sessions s JOIN artworks a ON s.artwork_id = a.id
                    WHERE a.user_id = ? ${yearFilter} GROUP BY index_val`,
                hours: `
                    SELECT strftime('%H', start_time) as index_val, COUNT(*) as count
                    FROM sessions s JOIN artworks a ON s.artwork_id = a.id
                    WHERE a.user_id = ? ${yearFilter} GROUP BY index_val`,
                months: `
                    SELECT strftime('%m', start_time) as index_val, 
                    COALESCE(SUM(duration_seconds), 0) as total_seconds
                    FROM sessions s JOIN artworks a ON s.artwork_id = a.id
                    WHERE a.user_id = ? ${yearFilter} GROUP BY index_val`,
                years: `
                    SELECT strftime('%Y', start_time) as index_val, 
                    COALESCE(SUM(duration_seconds), 0) as total_seconds
                    FROM sessions s JOIN artworks a ON s.artwork_id = a.id
                    WHERE a.user_id = ? GROUP BY index_val`
            };

            const result = {};
            const keys = Object.keys(queries);
            let completed = 0;

            keys.forEach(key => {
                db.all(queries[key], params, (err, rows) => {
                    if (err) result[key] = []; else result[key] = rows;
                    if (++completed === keys.length) resolve(result);
                });
            });
        });
    }

    getDailyActivity(userId, year) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT date(start_time) as date, COALESCE(SUM(duration_seconds), 0) as seconds
                FROM sessions s JOIN artworks a ON s.artwork_id = a.id
                WHERE a.user_id = ? AND strftime('%Y', s.start_time) = ?
                GROUP BY date(start_time)
            `;
            db.all(sql, [userId, String(year)], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getAllActivityDates(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT DISTINCT date(start_time) as date FROM sessions s JOIN artworks a ON s.artwork_id = a.id WHERE a.user_id = ? ORDER BY date DESC`;
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(r => r.date));
            });
        });
    }
}

module.exports = new StatsDAO();