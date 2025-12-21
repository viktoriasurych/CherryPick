import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { FireIcon, ClockIcon, Square3Stack3DIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import statsService from '../services/statsService';

const StatsSection = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                // 👇 ВИПРАВЛЕННЯ: Передаємо userId (який приходить у пропсах)
                const stats = await statsService.getStats(year, userId); 
                setData(stats);
            } catch (error) {
                console.error("Stats load error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [year, userId]); // 👇 userId вже є в залежностях, це добре

    if (loading) return <div className="p-10 text-center text-slate-500 text-xs animate-pulse font-pixel">Завантаження статистики...</div>;
    if (!data) return <div className="p-10 text-center text-slate-500 text-xs">Дані недоступні</div>;

    const { yearly, availableYears } = data;
    const kpi = yearly.kpi;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* 1. Header + KPI (В рядок, як ти просила) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Огляд активності</h3>
                     
                     <select 
                        value={year} 
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-cherry-500 cursor-pointer"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniKpi icon={Square3Stack3DIcon} label="Робіт" value={kpi.works_count || 0} color="text-purple-400" />
                    <MiniKpi icon={Squares2X2Icon} label="Колекцій" value={kpi.collections_count || 0} color="text-pink-400" />
                    <MiniKpi icon={ClockIcon} label="Час (год)" value={Math.round(kpi.total_time || 0)} color="text-blue-400" />
                    <MiniKpi icon={FireIcon} label="Стрік (днів)" value={kpi.current_streak || 0} color="text-orange-500" />
                </div>
            </div>

            {/* 2. Heatmap */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-pixel">Графік малювання</h3>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl overflow-x-auto">
                    <div className="min-w-[700px]">
                        <CalendarHeatmap
                            startDate={new Date(`${year}-01-01`)}
                            endDate={year === new Date().getFullYear() ? new Date() : new Date(`${year}-12-31`)}
                            values={yearly.heatmap}
                            classForValue={(value) => {
                                if (!value) return 'color-empty';
                                if (value.count < 30) return 'color-scale-1';
                                if (value.count < 60) return 'color-scale-2';
                                if (value.count < 120) return 'color-scale-3';
                                return 'color-scale-4';
                            }}
                            tooltipDataAttrs={value => ({
                                'data-tooltip-content': value.date ? `${value.date}: ${Math.round(value.count)} хв` : '',
                                'data-tooltip-id': 'stats-tooltip'
                            })}
                            showWeekdayLabels
                            gutterSize={3}
                        />
                        <ReactTooltip id="stats-tooltip" style={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: "12px" }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MiniKpi = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
        <div className={`p-2 rounded bg-slate-900 ${color} bg-opacity-10 shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0">
            <div className="text-lg font-bold text-slate-200 leading-none font-mono truncate">{value}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1 truncate">{label}</div>
        </div>
    </div>
);

export default StatsSection;