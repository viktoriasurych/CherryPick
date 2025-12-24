import React from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { formatHeatmapTooltip } from '../../utils/formatters';

const COLORS = ['#e11d48', '#db2777', '#c026d3', '#9333ea', '#7c3aed', '#4f46e5'];

// --- 1. КРУГОВА ДІАГРАМА ---
export const MyPieChart = ({ data, nameKey = "name" }) => {
    const validData = data ? data.filter(item => item.name !== 'Не вказано' && item.count > 0) : [];

    if (validData.length === 0) return <div className="text-slate-600 italic text-xs flex items-center justify-center h-full">Немає даних</div>;
    
    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie data={validData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="count" nameKey={nameKey}>
                        {validData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '12px'}} itemStyle={{color: '#fff'}} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto max-h-[50px] no-scrollbar px-2">
                {validData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                        <span className="truncate max-w-[80px]">{entry[nameKey]}</span> ({entry.count})
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 2. СТОВПЧАСТА ДІАГРАМА ---
export const MyBarChart = ({ data, xKey="name", yKey="value", color, barSize=20, type = "time", unit = "" }) => {
    if (!data || data.length === 0) 
        return <div className="text-slate-600 italic text-xs font-pixel opacity-50 flex items-center justify-center h-full">Немає даних</div>;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey={xKey} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} dy={5} />
                <YAxis 
                    tick={{fill: '#64748b', fontSize: 10}} 
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
                    cursor={{fill: '#1e293b', opacity: 0.4}} 
                    contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px'}} 
                    itemStyle={{color: '#fff'}} 
                    formatter={(value, name) => {
                        if (type === "number") return [`${value} ${unit}`, 'Кількість'];
                        const seconds = value; 
                        if (seconds === 0) return ['0 хв', 'Час'];
                        if (seconds < 60) return [`${Math.round(seconds)} с`, 'Час'];
                        else if (seconds < 3600) return [`${Math.round(seconds / 60)} хв`, 'Час'];
                        else return [`${(seconds / 3600).toFixed(1)} год`, 'Час'];
                    }}
                />
                <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} barSize={barSize} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// --- 3. КАЛЕНДАР (HEATMAP) ---
export const MyCalendarHeatmap = ({ year, values }) => {
    // 👇 ЛОГІКА ДАТ:
    const currentYear = new Date().getFullYear();
    const isCurrentYear = year === currentYear;

    // Якщо це поточний рік -> кінець сьогодні.
    // Якщо минулий рік -> кінець 31 грудня.
    const endDate = isCurrentYear ? new Date() : new Date(`${year}-12-31`);

    return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl overflow-x-auto custom-scrollbar relative group">
            <div className="min-w-[600px] md:min-w-[800px]">
                <CalendarHeatmap
                    startDate={new Date(`${year}-01-01`)}
                    endDate={endDate} // 👈 Використовуємо обчислену дату
                    values={values}
                    classForValue={(value) => {
                        if (!value) return 'color-empty';
                        if (value.count < 1800) return 'color-scale-1'; 
                        if (value.count < 3600) return 'color-scale-2'; 
                        if (value.count < 7200) return 'color-scale-3'; 
                        return 'color-scale-4';
                    }}
                    tooltipDataAttrs={value => ({
                        'data-tooltip-content': formatHeatmapTooltip(value),
                        'data-tooltip-id': 'heatmap-tooltip'
                    })}
                    showWeekdayLabels
                    gutterSize={2}
                />
                <ReactTooltip id="heatmap-tooltip" style={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "4px", fontSize: "10px", padding: "4px 8px" }} />
            </div>
        </div>
    );
};