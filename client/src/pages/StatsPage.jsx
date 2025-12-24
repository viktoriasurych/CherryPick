import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { FireIcon, ClockIcon, PaintBrushIcon, Square3Stack3DIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import statsService from '../services/statsService';
import Tabs from '../components/ui/Tabs'; 
import SearchableSelect from '../components/ui/SearchableSelect';

const COLORS = ['#e11d48', '#db2777', '#c026d3', '#9333ea', '#7c3aed', '#4f46e5'];

// 👇 Хелпер для форматування часу в Heatmap (Години, Хвилини, Секунди)
const formatHeatmapTooltip = (value) => {
    if (!value || !value.count) return 'Немає даних';
    
    const totalSeconds = Number(value.count);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h} год`);
    if (m > 0) parts.push(`${m} хв`);
    if (s > 0 || parts.length === 0) parts.push(`${s} с`);

    return `${value.date}: ${parts.join(' ')}`;
};

const StatsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activeTab, setActiveTab] = useState('GLOBAL'); 

    const STATS_TABS = [
        { id: 'GLOBAL', label: '🌍 За весь час' },
        { id: 'YEARLY', label: '📅 Хронологія' }
    ];

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const stats = await statsService.getStats(selectedYear);
                setData(stats);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedYear]);

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse font-pixel">Завантаження статистики...</div>;
    if (!data) return <div className="text-center py-20 text-red-500">Помилка завантаження</div>;

    const { availableYears, global, yearly } = data;
    const yearOptions = availableYears?.map(y => ({ value: y, label: y.toString() })) || [];

    // Фільтруємо нульові значення для PieChart
    const cleanData = (chartData) => {
        if (!chartData) return [];
        return chartData.filter(item => item.name !== 'Не вказано' && item.count > 0);
    };

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-slate-800 pb-0 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide mb-1 text-shadow-sm">Статистика</h1>
                </div>
                <Tabs items={STATS_TABS} activeId={activeTab} onChange={setActiveTab} />
            </div>

            {/* GLOBAL TAB */}
            {activeTab === 'GLOBAL' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="space-y-4">
                        <SectionTitle>Загальні показники</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KpiCard icon={ClockIcon} label="Загальний час малювання" value={`${global.kpi.total_time} год`} color="text-blue-400" />
                            <KpiCard icon={Square3Stack3DIcon} label="Загальна к-сть робіт" value={global.kpi.total_works} color="text-purple-400" />
                            <KpiCard icon={Squares2X2Icon} label="Загальна к-сть колекцій" value={global.kpi.total_collections} color="text-pink-400" />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Структура портфоліо</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartContainer title="Статус робіт"><MyPieChart data={cleanData(global.charts.status)} nameKey="status" /></ChartContainer>
                            <ChartContainer title="Види збірок"><MyPieChart data={cleanData(global.charts.collTypes)} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Творчий профіль</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ChartContainer title="Жанри"><MyPieChart data={cleanData(global.charts.genres)} /></ChartContainer>
                            <ChartContainer title="Стилі"><MyPieChart data={cleanData(global.charts.styles)} /></ChartContainer>
                            <ChartContainer title="Матеріали"><MyPieChart data={cleanData(global.charts.materials)} /></ChartContainer>
                            <ChartContainer title="Теги"><MyPieChart data={cleanData(global.charts.tags)} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Динаміка продуктивності</SectionTitle>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title="Активність по роках">
                                <MyBarChart data={global.charts.years} color="#c026d3" type="time" unit="год" />
                            </ChartContainer>
                            <ChartContainer title="Активність по місяцях">
                                <MyBarChart data={global.charts.months} color="#db2777" type="time" unit="год" />
                            </ChartContainer>
                        </div>
                    </section>
                </div>
            )}

            {/* YEARLY TAB */}
            {activeTab === 'YEARLY' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-slate-200">Огляд року</h2>
                        <div className="w-40">
                            <SearchableSelect options={yearOptions} value={selectedYear} onChange={setSelectedYear} placeholder="Рік..." />
                        </div>
                    </div>

                    <section className="space-y-4">
                        <SectionTitle>Підсумки року {selectedYear}</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KpiCard icon={ClockIcon} label={`Час малювання у ${selectedYear}`} value={`${yearly.kpi.total_time} год`} color="text-blue-400" />
                            <KpiCard icon={Square3Stack3DIcon} label={`Робіт за ${selectedYear}`} value={yearly.kpi.works_count} color="text-purple-400" />
                            <KpiCard icon={Squares2X2Icon} label={`Колекцій за ${selectedYear}`} value={yearly.kpi.collections_count} color="text-pink-400" />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Ритм активності</SectionTitle>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <KpiCard icon={FireIcon} label="Поточна серія (днів підряд)" value={`${yearly.kpi.current_streak} дн.`} color="text-orange-500" />
                                <KpiCard icon={PaintBrushIcon} label="Найдовша серія (рекорд)" value={`${yearly.kpi.longest_streak} дн.`} color="text-green-400" />
                            </div>
                            
                            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl relative group">
                                <div className="overflow-x-auto no-scrollbar">
                                    <div className="min-w-[800px]">
                                        <CalendarHeatmap
                                            startDate={new Date(`${selectedYear}-01-01`)}
                                            endDate={selectedYear === currentYear ? new Date() : new Date(`${selectedYear}-12-31`)}
                                            values={yearly.heatmap}
                                            classForValue={(value) => {
                                                if (!value) return 'color-empty';
                                                // Пороги в секундах: 30 хв, 1 год, 2 год
                                                if (value.count < 1800) return 'color-scale-1'; 
                                                if (value.count < 3600) return 'color-scale-2';
                                                if (value.count < 7200) return 'color-scale-3'; 
                                                return 'color-scale-4'; 
                                            }}
                                            // 👇 Форматуємо підказку
                                            titleForValue={formatHeatmapTooltip}
                                            showWeekdayLabels gutterSize={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Прогрес та Організація</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartContainer title={`Статус робіт (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.status)} nameKey="status" /></ChartContainer>
                            <ChartContainer title={`Типи колекцій (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.collTypes)} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Вподобання року</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ChartContainer title={`Жанри (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.genres)} /></ChartContainer>
                            <ChartContainer title={`Стилі (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.styles)} /></ChartContainer>
                            <ChartContainer title={`Матеріали (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.materials)} /></ChartContainer>
                            <ChartContainer title={`Теги (${selectedYear})`}><MyPieChart data={cleanData(yearly.charts.tags)} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Графік роботи</SectionTitle>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title={`Тривалість по днях тижня (${selectedYear})`}>
                                <MyBarChart data={yearly.charts.days} color="#f43f5e" type="time" unit="год" />
                            </ChartContainer>
                            <ChartContainer title={`Частота сеансів по годинах (${selectedYear})`}>
                                <MyBarChart data={yearly.charts.hours} xKey="name" yKey="value" color="#8b5cf6" type="number" unit="сесій" />
                            </ChartContainer>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

// --- КОМПОНЕНТИ ---

const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest border-l-4 border-cherry-600 pl-3">
        {children}
    </h3>
);

const KpiCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm h-full">
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
            {Icon && <div className={`p-1.5 rounded-lg bg-slate-900 ${color} bg-opacity-10 shrink-0 border border-slate-800`}><Icon className="w-5 h-5" /></div>}
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-200 font-mono tracking-tight break-all leading-tight">
            {value}
        </div>
    </div>
);

const ChartContainer = ({ title, children }) => (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col h-[320px] shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest text-center border-b border-slate-900 pb-2 truncate" title={title}>
            {title}
        </h4>
        <div className="flex-grow flex items-center justify-center w-full overflow-hidden">
            {children}
        </div>
    </div>
);

const MyPieChart = ({ data, nameKey = "name" }) => {
    if (!data || data.length === 0) return <div className="text-slate-600 italic text-xs">Немає даних</div>;
    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="count" nameKey={nameKey}>
                        {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '12px'}} itemStyle={{color: '#fff'}} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2 overflow-y-auto max-h-[50px] no-scrollbar px-2">
                {data.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                        <span className="truncate max-w-[80px]">{entry[nameKey]}</span> ({entry.count})
                    </div>
                ))}
            </div>
        </div>
    );
};

// 👇 ОНОВЛЕНИЙ ГРАФІК З ДЕСЯТКОВИМИ ЧИСЛАМИ ТА ПРАВИЛЬНИМ ТУЛТІПОМ
const MyBarChart = ({ data, xKey="name", yKey="value", color, barSize=20, type = "time", unit = "" }) => {
    if (!data || data.length === 0) 
        return <div className="text-slate-600 italic text-xs font-pixel opacity-50">Немає даних</div>;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey={xKey} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} dy={5} />
                <YAxis 
                    tick={{fill: '#64748b', fontSize: 10}} 
                    axisLine={false} 
                    tickLine={false} 
                    // Форматування осі Y (щоб показувати години, якщо це час)
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
                        
                        // value вже в секундах
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

export default StatsPage;