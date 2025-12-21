const statsDAO = require('../dao/statsDAO');

class StatsService {

    async getStats(userId, year) {
        // 1. Отримуємо рік початку, щоб сформувати список доступних років
        const startYear = await statsDAO.getStartYear(userId);
        const currentYear = new Date().getFullYear();
        
        const availableYears = [];
        for (let y = currentYear; y >= startYear; y--) {
            availableYears.push(y);
        }

        // 2. Отримуємо всі дати активності для розрахунку стріків (серій)
        const allActivityDates = await statsDAO.getAllActivityDates(userId);
        const streaks = this.calculateStreaks(allActivityDates);

        // 3. Запускаємо всі запити паралельно для швидкості
        const [
            globalTotals,
            globalDist,
            globalTime,
            yearlyTotals,
            yearlyDist,
            yearlyTime,
            dailyActivity
        ] = await Promise.all([
            // Глобальні (year = null)
            statsDAO.getTotals(userId, null),
            statsDAO.getDistributions(userId, null),
            statsDAO.getTimePatterns(userId, null),
            
            // Річні (year = вибраний рік)
            statsDAO.getTotals(userId, year),
            statsDAO.getDistributions(userId, year),
            statsDAO.getTimePatterns(userId, year),
            
            // Heatmap (конкретний рік)
            statsDAO.getDailyActivity(userId, year)
        ]);

        // 4. Форматуємо результат як очікує фронтенд
        return {
            availableYears,
            global: {
                kpi: {
                    total_time: (globalTotals.total_seconds / 3600).toFixed(1), // переводимо в години
                    total_works: globalTotals.works_count,
                    total_collections: globalTotals.collections_count,
                    ...streaks // додаємо current_streak, longest_streak
                },
                charts: {
                    ...globalDist,
                    ...globalTime
                }
            },
            yearly: {
                kpi: {
                    total_time: (yearlyTotals.total_seconds / 3600).toFixed(1),
                    works_count: yearlyTotals.works_count,
                    collections_count: yearlyTotals.collections_count,
                    current_streak: streaks.current_streak, // дублюємо для зручності
                    longest_streak: streaks.longest_streak
                },
                charts: {
                    ...yearlyDist,
                    ...yearlyTime
                },
                heatmap: dailyActivity.map(item => ({
                    date: item.date,
                    count: Math.round(item.seconds / 60) // переводимо секунди в хвилини для інтенсивності кольору
                }))
            }
        };
    }

    // Допоміжний метод для розрахунку серій
    calculateStreaks(dates) {
        if (!dates || dates.length === 0) {
            return { current_streak: 0, longest_streak: 0 };
        }

        // dates приходить відсортованим DESC (найновіші перші) у форматі 'YYYY-MM-DD'
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 1. Рахуємо поточний стрік
        // Перевіряємо, чи малювали ми сьогодні або вчора
        if (dates[0] === today || dates[0] === yesterday) {
            currentStreak = 1;
            let lastDate = new Date(dates[0]);

            for (let i = 1; i < dates.length; i++) {
                const currentDate = new Date(dates[i]);
                const diffTime = Math.abs(lastDate - currentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                    lastDate = currentDate;
                } else {
                    break;
                }
            }
        }

        // 2. Рахуємо найдовший стрік
        if (dates.length > 0) {
            tempStreak = 1;
            let lastDate = new Date(dates[0]);

            for (let i = 1; i < dates.length; i++) {
                const currentDate = new Date(dates[i]);
                const diffTime = Math.abs(lastDate - currentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
                lastDate = currentDate;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        return { current_streak: currentStreak, longest_streak: longestStreak };
    }
}

module.exports = new StatsService();