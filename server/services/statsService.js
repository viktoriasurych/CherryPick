const statsDAO = require('../dao/statsDAO');

class StatsService {
    
    fillGaps(data, type) {
        let filled = [];
        const map = {};
        data.forEach(item => {
            map[String(item.index_val)] = Number(item.total_seconds || item.count || 0);
        });

        if (type === 'months') {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 1; i <= 12; i++) {
                const keyPad = i.toString().padStart(2, '0');
                const keyRaw = i.toString();
                
                const val = map[keyPad] || map[keyRaw] || 0;
                
                filled.push({ name: monthNames[i-1], value: val });
            }
        } 
        else if (type === 'days') {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; 
            for (let i = 0; i <= 6; i++) {
                const key = i.toString();
                filled.push({ name: dayNames[i], value: map[key] || 0 });
            }
        } 
        else if (type === 'hours') {
            for (let i = 0; i <= 23; i++) {
                const keyPad = i.toString().padStart(2, '0');
                const keyRaw = i.toString();
                const val = map[keyPad] || map[keyRaw] || 0;
                
                filled.push({ name: `${keyPad}:00`, value: val });
            }
        }
        else if (type === 'years') {
            return data
                .map(item => ({ name: String(item.index_val), value: Number(item.total_seconds) }))
                .sort((a, b) => a.name.localeCompare(b.name));
        }

        return filled;
    }

    calculateStreaks(dates) {
        if (!dates || dates.length === 0) {
            return { current_streak: 0, longest_streak: 0 };
        }
        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const normalizeDate = (dateStr) => {
            const d = new Date(dateStr);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        };

        const todayTime = normalizeDate(new Date());
        const yesterdayTime = todayTime - (86400000);

        const lastActivityTime = normalizeDate(uniqueDates[0]);

        if (lastActivityTime === todayTime || lastActivityTime === yesterdayTime) {
            currentStreak = 1;
            let prevTime = lastActivityTime;

            for (let i = 1; i < uniqueDates.length; i++) {
                const currTime = normalizeDate(uniqueDates[i]);
                const diff = prevTime - currTime;

                if (diff === 86400000) { 
                    currentStreak++;
                    prevTime = currTime;
                } else {
                    break;
                }
            }
        }

        const sortedAsc = [...uniqueDates].sort((a, b) => new Date(a) - new Date(b));
        
        if (sortedAsc.length > 0) {
            tempStreak = 1;
            longestStreak = 1;
            let prevTime = normalizeDate(sortedAsc[0]);

            for (let i = 1; i < sortedAsc.length; i++) {
                const currTime = normalizeDate(sortedAsc[i]);
                const diff = currTime - prevTime;

                if (diff === 86400000) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }

                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
                prevTime = currTime;
            }
        }

        return { current_streak: currentStreak, longest_streak: longestStreak };
    }

    async getStats(userId, year, useRegistrationDate = false) {
        
        let startYear;
        if (useRegistrationDate) {
            startYear = await statsDAO.getRegistrationYear(userId); 
        } else {
            startYear = await statsDAO.getStartYear(userId); 
        }
        if (!startYear) startYear = new Date().getFullYear();

        const currentYear = new Date().getFullYear();
        const availableYears = [];
        for (let y = currentYear; y >= startYear; y--) {
            availableYears.push(y);
        }

        const allActivityDates = await statsDAO.getAllActivityDates(userId);
        const streaks = this.calculateStreaks(allActivityDates);

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
            statsDAO.getTotals(userId, null),
            statsDAO.getDistributions(userId, null),
            statsDAO.getTimePatterns(userId, null),
            
            statsDAO.getTotals(userId, year),
            statsDAO.getDistributions(userId, year),
            statsDAO.getTimePatterns(userId, year),
            
            statsDAO.getDailyActivity(userId, year),
            statsDAO.getGlobalImpact(userId)
        ]);

        return {
            availableYears,

            impact: {
                views: Number(globalImpact?.total_views || 0),
                saves: Number(globalImpact?.total_saves || 0)
            },
            
            overview: {
                total_time: ((globalTotals?.total_seconds || 0) / 3600).toFixed(1),
                total_works: Number(globalTotals?.works_count || 0),
                total_collections: Number(globalTotals?.collections_count || 0),
                current_streak: streaks.current_streak,
                longest_streak: streaks.longest_streak
            },

            heatmap: dailyActivity.map(item => ({
                date: item.date,
                count: Number(item.seconds)
            })),

            global: {
                kpi: {
                    total_time: ((globalTotals?.total_seconds || 0) / 3600).toFixed(1),
                    total_works: Number(globalTotals?.works_count || 0),
                    total_collections: Number(globalTotals?.collections_count || 0),
                    ...streaks
                },
                charts: {
                    ...globalDist,
                    years: this.fillGaps(globalTime.years, 'years'),
                    months: this.fillGaps(globalTime.months, 'months')
                }
            },

            yearly: {
                kpi: {
                    total_time: ((yearlyTotals?.total_seconds || 0) / 3600).toFixed(1),
                    works_count: Number(yearlyTotals?.works_count || 0),
                    collections_count: Number(yearlyTotals?.collections_count || 0),
                    current_streak: streaks.current_streak,
                    longest_streak: streaks.longest_streak
                },
                charts: {
                    ...yearlyDist,
                    days: this.fillGaps(yearlyTime.days, 'days'),
                    hours: this.fillGaps(yearlyTime.hours, 'hours')
                },
                heatmap: dailyActivity.map(item => ({
                    date: item.date,
                    count: Number(item.seconds)
                }))
            }
        };
    }
}

module.exports = new StatsService();