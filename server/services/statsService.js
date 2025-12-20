const statsDAO = require('../dao/statsDAO');

class StatsService {

    formatFullTime(totalSeconds) {
        if (!totalSeconds || totalSeconds === 0) return "0с";
        let s = Number(totalSeconds); // Гарантуємо число
        const y = Math.floor(s / (3600 * 24 * 365)); s %= (3600 * 24 * 365);
        const mon = Math.floor(s / (3600 * 24 * 30)); s %= (3600 * 24 * 30);
        const d = Math.floor(s / (3600 * 24)); s %= (3600 * 24);
        const h = Math.floor(s / 3600); s %= 3600;
        const m = Math.floor(s / 60); s %= 60;
        const secs = Math.floor(s);

        const parts = [];
        if (y) parts.push(`${y}р`);
        if (mon) parts.push(`${mon}м`);
        if (d) parts.push(`${d}д`);
        if (h) parts.push(`${h}г`);
        if (m) parts.push(`${m}х`);
        if (secs || parts.length === 0) parts.push(`${secs}с`);
        return parts.join(' ');
    }

    prepareChartData(rows, labels, valueKey = 'total_seconds', isHours = false) {
        // 👇 ДЕБАГ: Дивимось, що прийшло
        // console.log(`[DEBUG] Chart Data for key ${valueKey}:`, rows);

        return labels.map((label, index) => {
            const found = rows.find(r => parseInt(r.index_val) === index);
            let val = found ? (isHours ? found.count : found[valueKey]) : 0;
            
            // Конвертуємо в години, але НЕ ОКРУГЛЮЄМО тут, щоб бачити малі значення
            if (!isHours && valueKey === 'total_seconds') {
                val = val / 3600; 
            }
            return { name: label, value: val };
        });
    }

    async getDashboardStats(userId, year) {
        const startYear = await statsDAO.getStartYear(userId);
        const currentYear = new Date().getFullYear();
        const availableYears = [];
        for (let y = currentYear; y >= startYear; y--) availableYears.push(y);

        const [
            totalsGlobal, totalsYearly,
            distGlobal, distYearly,
            timeGlobal, timeYearly,
            heatmapData, activityDates
        ] = await Promise.all([
            statsDAO.getTotals(userId, null),
            statsDAO.getTotals(userId, year),
            statsDAO.getDistributions(userId, null),
            statsDAO.getDistributions(userId, year),
            statsDAO.getTimePatterns(userId, null),
            statsDAO.getTimePatterns(userId, year),
            statsDAO.getDailyActivity(userId, year),
            statsDAO.getAllActivityDates(userId)
        ]);

        // 👇 ДЕБАГ: Якщо тут 0, значить біда в SQL
        console.log('>>> [DEBUG] Totals Global:', totalsGlobal);
        console.log('>>> [DEBUG] Time Global Days:', timeGlobal.days);

        const streaks = this.calculateStreaks(activityDates);
        const heatmap = heatmapData.map(r => ({ date: r.date, count: Math.round(r.seconds/60) }));

        // Лейбли
        const daysLabels = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const monthsLabels = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']; 
        // або текстові, але індекс в SQLite 01..12, тому parseInt('01') = 1.
        // Масиви в JS з 0. Тому для місяців треба хитрий маппінг.
        // SQLite %m повертає 01-12. Array index 0-11.
        // Тому ми передаємо лейбли і в prepareChartData логіка index+1? Ні, там index.
        // ВИПРАВЛЕННЯ ДЛЯ МІСЯЦІВ:
        const monthsData = Array.from({length: 12}, (_, i) => {
            const found = timeGlobal.months.find(r => parseInt(r.index_val) === i + 1); // +1 бо січень це 1
            let val = found ? found.total_seconds : 0;
            return { name: monthsLabels[i], value: val / 3600 };
        });

        const yearsData = timeGlobal.years.map(r => ({ name: r.index_val, value: r.total_seconds / 3600 }));

        const hoursLabels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
        const shiftDays = (arr) => [...arr.slice(1), arr[0]];

        return {
            availableYears,
            global: {
                kpi: {
                    total_time: this.formatFullTime(totalsGlobal.total_seconds),
                    total_works: totalsGlobal.works_count,
                    total_collections: totalsGlobal.collections_count
                },
                charts: {
                    status: distGlobal.status,
                    collTypes: distGlobal.collTypes,
                    genres: distGlobal.genres,
                    styles: distGlobal.styles,
                    materials: distGlobal.materials,
                    tags: distGlobal.tags,
                    days: shiftDays(this.prepareChartData(timeGlobal.days, daysLabels)),
                    hours: this.prepareChartData(timeGlobal.hours, hoursLabels, 'count', true),
                    months: monthsData,
                    years: yearsData
                }
            },
            yearly: {
                year: Number(year),
                kpi: {
                    total_time: this.formatFullTime(totalsYearly.total_seconds),
                    works_count: totalsYearly.works_count,
                    collections_count: totalsYearly.collections_count,
                    current_streak: streaks.current,
                    longest_streak: streaks.longest
                },
                heatmap,
                charts: {
                    status: distYearly.status,
                    collTypes: distYearly.collTypes,
                    genres: distYearly.genres,
                    styles: distYearly.styles,
                    materials: distYearly.materials,
                    tags: distYearly.tags,
                    days: shiftDays(this.prepareChartData(timeYearly.days, daysLabels)),
                    hours: this.prepareChartData(timeYearly.hours, hoursLabels, 'count', true)
                }
            }
        };
    }

    calculateStreaks(dates) {
        if (!dates || dates.length === 0) return { current: 0, longest: 0 };
        const uniqueDates = [...new Set(dates)];
        let currentStreak = 0; let longestStreak = 0; let tempStreak = 1;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDates.length - 1; i++) {
                const diff = Math.ceil(Math.abs(new Date(uniqueDates[i]) - new Date(uniqueDates[i+1])) / (1000 * 60 * 60 * 24));
                if (diff === 1) currentStreak++; else break;
            }
        }
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const diff = Math.ceil(Math.abs(new Date(uniqueDates[i]) - new Date(uniqueDates[i+1])) / (1000 * 60 * 60 * 24));
            if (diff === 1) tempStreak++;
            else { if (tempStreak > longestStreak) longestStreak = tempStreak; tempStreak = 1; }
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        return { current: currentStreak, longest: longestStreak };
    }
}

module.exports = new StatsService();