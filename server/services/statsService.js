const statsDAO = require('../dao/statsDAO');

class StatsService {

    // --- ДОПОМІЖНИЙ МЕТОД: ЗАПОВНЕННЯ ПРОГАЛИН ---
    // Робить так, щоб графіки завжди мали повну вісь X (січень-грудень, 00:00-23:00 тощо)
    fillGaps(data, type) {
        let filled = [];
        const map = {};
        
        // Перетворюємо отримані дані в мапу для швидкого пошуку: { "01": 500, "02": 0 }
        data.forEach(item => {
            map[item.index_val] = item.total_seconds || item.count || 0;
        });

        if (type === 'months') {
            const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
            for (let i = 1; i <= 12; i++) {
                // Формуємо ключ '01', '02'... як повертає SQL
                const key = i.toString().padStart(2, '0');
                filled.push({ name: monthNames[i-1], value: map[key] || 0 });
            }
        } 
        else if (type === 'days') {
            // SQL повертає 0=Неділя, 1=Понеділок...
            const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]; 
            for (let i = 0; i <= 6; i++) {
                const key = i.toString();
                filled.push({ name: dayNames[i], value: map[key] || 0 });
            }
        } 
        else if (type === 'hours') {
            for (let i = 0; i <= 23; i++) {
                const key = i.toString().padStart(2, '0'); // '00', '01'...
                filled.push({ name: `${key}:00`, value: map[key] || 0 });
            }
        }
        else if (type === 'years') {
            // Для років просто повертаємо те, що є, але сортуємо (бо роки нефіксовані)
            return data
                .map(item => ({ name: item.index_val, value: item.total_seconds }))
                .sort((a, b) => a.name - b.name);
        }

        return filled;
    }

    // --- ОСНОВНИЙ МЕТОД ОТРИМАННЯ СТАТИСТИКИ ---
    async getStats(userId, year, useRegistrationDate = false) {
        
        // 1. Визначаємо рік початку (або реєстрація, або перша робота)
        let startYear;
        if (useRegistrationDate) {
            startYear = await statsDAO.getRegistrationYear(userId); 
        } else {
            startYear = await statsDAO.getStartYear(userId); 
        }

        const currentYear = new Date().getFullYear();
        const availableYears = [];
        // Формуємо список доступних років (наприклад, [2025, 2024, 2023])
        for (let y = currentYear; y >= startYear; y--) {
            availableYears.push(y);
        }

        // 2. Рахуємо стріки (серії активності)
        const allActivityDates = await statsDAO.getAllActivityDates(userId);
        const streaks = this.calculateStreaks(allActivityDates);

        // 3. Запускаємо всі запити до БД паралельно (для швидкості)
        const [
            globalTotals,
            globalDist,
            globalTime,
            yearlyTotals,
            yearlyDist,
            yearlyTime,
            dailyActivity,
            globalImpact 
        ] = await Promise.all([
            // Глобальні дані (year = null)
            statsDAO.getTotals(userId, null),
            statsDAO.getDistributions(userId, null),
            statsDAO.getTimePatterns(userId, null),
            
            // Дані за вибраний рік
            statsDAO.getTotals(userId, year),
            statsDAO.getDistributions(userId, year),
            statsDAO.getTimePatterns(userId, year),
            
            // Heatmap (тільки за вибраний рік)
            statsDAO.getDailyActivity(userId, year),

            // Вплив (глобально)
            statsDAO.getGlobalImpact(userId)
        ]);

        // 4. Формуємо фінальний об'єкт відповіді
        return {
            availableYears,

            // Блок для профілю (Views / Saves)
            impact: {
                views: globalImpact.total_views,
                saves: globalImpact.total_saves
            },
            
            // Загальний огляд для профілю
            overview: {
                total_time: (globalTotals.total_seconds / 3600).toFixed(1),
                total_works: globalTotals.works_count,
                total_collections: globalTotals.collections_count,
                current_streak: streaks.current_streak,
                longest_streak: streaks.longest_streak
            },

            // Дані для Heatmap (календаря)
            heatmap: dailyActivity.map(item => ({
                date: item.date,
                count: item.seconds // Передаємо секунди, фронтенд сам переведе в хвилини в тултипі
            })),

            // --- ВКЛАДКА "ЗА ВЕСЬ ЧАС" ---
            global: {
                kpi: {
                    total_time: (globalTotals.total_seconds / 3600).toFixed(1),
                    total_works: globalTotals.works_count,
                    total_collections: globalTotals.collections_count,
                    ...streaks
                },
                charts: {
                    ...globalDist,
                    // 👇 Заповнюємо прогалини в графіках
                    years: this.fillGaps(globalTime.years, 'years'),
                    months: this.fillGaps(globalTime.months, 'months')
                }
            },

            // --- ВКЛАДКА "ХРОНОЛОГІЯ" (за рік) ---
            yearly: {
                kpi: {
                    total_time: (yearlyTotals.total_seconds / 3600).toFixed(1),
                    works_count: yearlyTotals.works_count,
                    collections_count: yearlyTotals.collections_count,
                    current_streak: streaks.current_streak,
                    longest_streak: streaks.longest_streak
                },
                charts: {
                    ...yearlyDist,
                    // 👇 Заповнюємо прогалини в графіках
                    days: this.fillGaps(yearlyTime.days, 'days'),
                    hours: this.fillGaps(yearlyTime.hours, 'hours')
                },
                // Дублюємо heatmap сюди для зручності
                heatmap: dailyActivity.map(item => ({
                    date: item.date,
                    count: item.seconds
                }))
            }
        };
    }

    // --- ЛОГІКА ПІДРАХУНКУ СТРІКІВ ---
    calculateStreaks(dates) {
        if (!dates || dates.length === 0) {
            return { current_streak: 0, longest_streak: 0 };
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Отримуємо сьогоднішню і вчорашню дати у форматі YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 1. Рахуємо ПОТОЧНИЙ стрік (тільки якщо остання активність була сьогодні або вчора)
        if (dates[0] === today || dates[0] === yesterday) {
            currentStreak = 1;
            let lastDate = new Date(dates[0]);

            for (let i = 1; i < dates.length; i++) {
                const currentDate = new Date(dates[i]);
                const diffTime = Math.abs(lastDate - currentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (diffDays === 1) { // Якщо різниця рівно 1 день -> стрік продовжується
                    currentStreak++;
                    lastDate = currentDate;
                } else {
                    break; // Розрив
                }
            }
        }

        // 2. Рахуємо НАЙДОВШИЙ стрік за всю історію
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
            // Перевірка останнього стріка після циклу
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        return { current_streak: currentStreak, longest_streak: longestStreak };
    }
}

module.exports = new StatsService();