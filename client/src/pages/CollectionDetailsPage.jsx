import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { FireIcon, ClockIcon, PaintBrushIcon, Square3Stack3DIcon } from '@heroicons/react/24/solid';
import statsService from '../services/statsService';
import Tabs from '../components/ui/Tabs'; 
import SearchableSelect from '../components/ui/SearchableSelect'; // 👈 Використовуємо універсальний селект

// Палітра кольорів для графіків
const COLORS = ['#e11d48', '#db2777', '#c026d3', '#9333ea', '#7c3aed', '#4f46e5'];

const StatsPage = () => {
    // Стан
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Рік (за замовчуванням поточний)
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    
    // Таби
    const [activeTab, setActiveTab] = useState('GLOBAL'); 
    const STATS_TABS = [
        { id: 'GLOBAL', label: '🌍 За весь час' },
        { id: 'YEARLY', label: '📅 Хронологія' }
    ];

    // Завантаження даних
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Запитуємо статистику (сервер поверне і глобальну, і річну за selectedYear)
                const stats = await statsService.getStats(selectedYear);
                setData(stats);
            } catch (error) {
                console.error("Помилка завантаження статистики:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedYear]);

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Збираємо статистику...</div>;
    if (!data) return <div className="text-center py-20 text-red-500">Помилка завантаження даних</div>;

    const { availableYears, global, yearly } = data;

    // Підготовка опцій для селекту років
    const yearOptions = availableYears 
        ? availableYears.map(y => ({ value: y, label: y.toString() }))
        : [];

    // Логіка для Heatmap (не показувати майбутні дні)
    const getEndDate = () => {
        if (selectedYear === currentYear) return new Date();
        return new Date(`${selectedYear}-12-31`);
    };

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header + Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-slate-800 pb-0 gap-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide mb-1">Статистика</h1>
                    <p className="text-slate-500 text-sm">Аналітика твоєї творчості</p>
                </div>
                
                {/* Перемикач режимів */}
                <div className="w-full md:w-auto">
                    <Tabs items={STATS_TABS} activeId={activeTab} onChange={setActiveTab} />
                </div>
            </div>

            {/* === ВМІСТ 1: GLOBAL (За весь час) === */}
            {activeTab === 'GLOBAL' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* KPI Cards Global */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard icon={ClockIcon} label="Всього годин" value={global.kpi.total_hours} color="text-blue-400" />
                        <KpiCard icon={Square3Stack3DIcon} label="Всього робіт" value={global.kpi.total_works} subValue="Архів" color="text-purple-400" />
                        <KpiCard icon={FireIcon} label="Поточна серія" value={`${global.kpi.current_streak} днів`} color="text-orange-500" />
                        <KpiCard icon={PaintBrushIcon} label="Рекорд серії" value={`${global.kpi.longest_streak} днів`} color="text-green-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Жанри Global */}
                        <ChartContainer title="Улюблені жанри (Все життя)">
                             {global.charts.genres.length > 0 ? (
                                <MyPieChart data={global.charts.genres} />
                            ) : <EmptyChartMsg />}
                        </ChartContainer>

                        {/* Статус Global */}
                        <ChartContainer title="Статистика завершення">
                             {global.charts.status.length > 0 ? (
                                <MyPieChart data={global.charts.status} nameKey="status" />
                            ) : <EmptyChartMsg />}
                        </ChartContainer>

                        {/* Дні тижня */}
                        <ChartContainer title="Продуктивність по днях">
                            <MyBarChart data={global.charts.days} color="#e11d48" />
                        </ChartContainer>

                        {/* Години */}
                        <ChartContainer title="Біоритм (Години доби)">
                            <MyBarChart data={global.charts.hours} xKey="hour" yKey="session_count" color="#7c3aed" barSize={10} />
                        </ChartContainer>
                    </div>
                </div>
            )}


            {/* === ВМІСТ 2: YEARLY (По роках) === */}
            {activeTab === 'YEARLY' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Панель керування роком */}
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-slate-200">Огляд року</h2>
                            <p className="text-xs text-slate-500">Виберіть рік для детального аналізу</p>
                        </div>
                        
                        {/* 👇 ВИБІР РОКУ ЧЕРЕЗ SearchableSelect */}
                        <div className="w-40">
                            <SearchableSelect 
                                options={yearOptions}
                                value={selectedYear}
                                onChange={setSelectedYear}
                                placeholder="Рік..."
                            />
                        </div>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl overflow-hidden relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                                📅 Календар активності
                            </h3>
                            <div className="text-xs text-slate-500 font-mono border border-slate-800 px-2 py-1 rounded">
                                {yearly.kpi.works_count} робіт створено у {selectedYear}
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto pb-2 no-scrollbar">
                            <div className="min-w-[800px]">
                                <CalendarHeatmap
                                    startDate={new Date(`${selectedYear}-01-01`)}
                                    endDate={getEndDate()}
                                    values={yearly.heatmap}
                                    classForValue={(value) => {
                                        if (!value) return 'color-empty';
                                        if (value.count < 30) return 'color-scale-1';  // < 30 хв
                                        if (value.count < 60) return 'color-scale-2';  // < 1 год
                                        if (value.count < 120) return 'color-scale-3'; // < 2 год
                                        return 'color-scale-4';                        // > 2 год
                                    }}
                                    titleForValue={(value) => value ? `${value.date}: ${Math.floor(value.count/60)} год ${value.count%60} хв` : 'Немає даних'}
                                    showWeekdayLabels
                                    gutterSize={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Жанри Yearly */}
                         <ChartContainer title={`Жанри у ${selectedYear} році`}>
                            {yearly.charts.genres.length > 0 ? (
                                <MyPieChart data={yearly.charts.genres} />
                            ) : (
                                <EmptyChartMsg />
                            )}
                        </ChartContainer>

                        {/* Статус Yearly */}
                        <ChartContainer title={`Статус робіт (${selectedYear})`}>
                            {yearly.charts.status.length > 0 ? (
                                <MyPieChart data={yearly.charts.status} nameKey="status" />
                            ) : (
                                <EmptyChartMsg />
                            )}
                        </ChartContainer>
                    </div>
                </div>
            )}

        </div>
    );
};

// --- Sub-components (для чистоти коду) ---

const KpiCard = ({ icon: Icon, label, value, subValue, color }) => (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition group h-full shadow-sm hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
            <div className={`p-2 rounded-lg bg-slate-900 ${color} bg-opacity-10 group-hover:scale-110 transition shrink-0 border border-slate-800`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div>
            <div className="text-xl md:text-3xl font-bold text-slate-200 font-mono tracking-tight">{value}</div>
            {subValue && <div className="text-[10px] md:text-xs text-slate-500 mt-1">{subValue}</div>}
        </div>
    </div>
);

const ChartContainer = ({ title, children }) => (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col h-[350px]">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider text-center border-b border-slate-900 pb-2">{title}</h4>
        <div className="flex-grow flex flex-col justify-center">
            {children}
        </div>
    </div>
);

const EmptyChartMsg = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
        <div className="text-2xl">💤</div>
        <div className="text-sm italic">Немає даних</div>
    </div>
);

// Обгортка для кругової діаграми
const MyPieChart = ({ data, nameKey = "name" }) => (
    <>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey={nameKey}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + (nameKey==='status'?2:0)) % COLORS.length]} stroke="none" />
                    ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px'}} itemStyle={{color: '#fff'}} />
            </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-3 mt-auto pt-2">
            {data.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[(index + (nameKey==='status'?2:0)) % COLORS.length]}}></span>
                    {entry[nameKey]} <span className="text-slate-600">({entry.count})</span>
                </div>
            ))}
        </div>
    </>
);

// Обгортка для стовпчикової діаграми
const MyBarChart = ({ data, xKey="name", yKey="value", color, barSize=20 }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey={xKey} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
            <RechartsTooltip cursor={{fill: '#1e293b', opacity: 0.4}} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px'}} itemStyle={{color: '#fff'}} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} barSize={barSize} />
        </BarChart>
    </ResponsiveContainer>
);

export default StatsPage;