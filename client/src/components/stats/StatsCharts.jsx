import React, { useMemo } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// 👇 Перевір, чи правильний шлях до твого форматера
import { formatHeatmapTooltip } from '../../utils/formatters';

// 👇 Масив назв змінних CSS для Pie Chart
const CHART_COLOR_VARS = [
    '--color-chart-1',
    '--color-chart-2',
    '--color-chart-3',
    '--color-chart-4',
    '--color-chart-5',
    '--color-chart-6',
];

// ============================================================================
// 1. КРУГОВА ДІАГРАМА (PIE CHART)
// ============================================================================
export const MyPieChart = ({ data, nameKey = "name" }) => {
    const validData = data ? data.filter(item => item.name !== 'Не вказано' && item.count > 0) : [];

    if (validData.length === 0) {
        return <div className="text-muted italic text-xs flex items-center justify-center h-full font-mono">No Data</div>;
    }
    
    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie 
                        data={validData} 
                        cx="50%" cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="count" 
                        nameKey={nameKey}
                        stroke="none"
                    >
                        {validData.map((entry, index) => (
                            <Cell 
                                key={index} 
                                fill={`var(${CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]})`} 
                            />
                        ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{
                            backgroundColor: 'var(--color-ash)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '2px',
                            color: 'var(--color-bone)',
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)'
                        }} 
                        itemStyle={{color: 'var(--color-bone)'}} 
                    />
                </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto max-h-[60px] custom-scrollbar px-2">
                {validData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[9px] text-muted font-bold uppercase tracking-wide font-mono">
                        <span 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{backgroundColor: `var(${CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]})`}}
                        ></span>
                        <span className="truncate max-w-[80px]">{entry[nameKey]}</span> 
                        <span className="text-bone">({entry.count})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// 2. СТОВПЧАСТА ДІАГРАМА (BAR CHART)
// ============================================================================
export const MyBarChart = ({ data, xKey="name", yKey="value", color, barSize=20, type = "time", unit = "" }) => {
    if (!data || data.length === 0) {
        return <div className="text-muted italic text-xs font-mono opacity-50 flex items-center justify-center h-full">No Data</div>;
    }
    
    const barColor = color || 'var(--color-blood)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.3} />
                
                <XAxis 
                    dataKey={xKey} 
                    tick={{fill: 'var(--color-muted)', fontSize: 10, fontFamily: 'var(--font-mono)'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={5} 
                />
                
                <YAxis 
                    tick={{fill: 'var(--color-muted)', fontSize: 10, fontFamily: 'var(--font-mono)'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => {
                        if (type === 'time') {
                            const hours = val / 3600;
                            return hours === 0 ? "0" : hours.toFixed(1); 
                        }
                        return val;
                    }}
                />
                
                <RechartsTooltip 
                    cursor={{fill: 'var(--color-ash)', opacity: 0.4}} 
                    contentStyle={{
                        backgroundColor: 'var(--color-ash)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: '2px',
                        color: 'var(--color-bone)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)'
                    }} 
                    itemStyle={{color: 'var(--color-bone)'}}
                    formatter={(value, name) => {
                        if (type === "number") return [`${value} ${unit}`, 'Count'];
                        const seconds = value; 
                        if (seconds === 0) return ['0 min', 'Time'];
                        if (seconds < 60) return [`${Math.round(seconds)} s`, 'Time'];
                        else if (seconds < 3600) return [`${Math.round(seconds / 60)} min`, 'Time'];
                        else return [`${(seconds / 3600).toFixed(1)} h`, 'Time'];
                    }}
                />
                
                <Bar 
                    dataKey={yKey} 
                    fill={barColor} 
                    radius={[2, 2, 0, 0]} 
                    barSize={barSize} 
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

// ============================================================================
// 3. КАЛЕНДАР (HEATMAP)
// ============================================================================
export const MyCalendarHeatmap = ({ year, values, variant = "calendar" }) => {
    // variant = "calendar" -> показує сітку Jan 1 - Dec 31 (маленькі квадратики, багато порожніх, якщо рік новий)
    // variant = "rolling"  -> показує останні 365 днів (GitHub style, заповнений хвіст)

    const today = new Date();
    const currentYear = today.getFullYear();
    const isCurrentYear = year === currentYear;

    let startDate, endDate;

    if (variant === "rolling" && isCurrentYear) {
        // Режим для ПРОФІЛЮ (щоб було красиво)
        endDate = today;
        startDate = new Date();
        startDate.setDate(today.getDate() - 365);
    } else {
        // Режим для СТАТИСТИКИ (або минулі роки)
        // Суворий календарний рік. Це гарантує правильний розмір клітинок.
        startDate = new Date(`${year}-01-01`);
        endDate = new Date(`${year}-12-31`);
    }

    // 1. Знаходимо максимум для відносної шкали
    const maxValue = useMemo(() => {
        if (!values || values.length === 0) return 0;
        return Math.max(...values.map(v => v.count));
    }, [values]);

    // 2. Функція кольору (Relative Scale)
    const getScaleClass = (value) => {
        if (!value || value.count === 0) return 'color-empty';
        if (maxValue === 0) return 'color-scale-1';

        const ratio = value.count / maxValue;

        if (ratio <= 0.2) return 'color-scale-1'; // Low
        if (ratio <= 0.4) return 'color-scale-2'; // Med-Low
        if (ratio <= 0.6) return 'color-scale-3'; // Med
        if (ratio <= 0.8) return 'color-scale-4'; // High
        return 'color-scale-5';                   // Record
    };

    return (
        <div className="relative group min-w-[800px] w-full flex flex-col">
            
            <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={values}
                classForValue={getScaleClass}
                tooltipDataAttrs={value => ({
                    'data-tooltip-content': formatHeatmapTooltip(value),
                    'data-tooltip-id': 'heatmap-tooltip'
                })}
                showWeekdayLabels
                gutterSize={2}
            />
            
            {/* Легенда */}
            <div className="flex items-center justify-end gap-2 text-[10px] text-muted font-mono select-none -mt-6 mr-2">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-0)]" title="No contributions"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-1)]" title="Low"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-2)]" title="Medium-Low"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-3)]" title="Medium"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-4)]" title="High"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-scale-5)]" title="Record"></div>
                </div>
                <span>More</span>
            </div>

            <ReactTooltip 
                id="heatmap-tooltip" 
                style={{ 
                    backgroundColor: "var(--color-ash)", 
                    color: "var(--color-bone)", 
                    border: "1px solid var(--color-border)",
                    borderRadius: "2px", 
                    fontSize: "10px", 
                    padding: "4px 8px",
                    fontFamily: "var(--font-mono)",
                    zIndex: 50 
                }} 
            />
        </div>
    );
};