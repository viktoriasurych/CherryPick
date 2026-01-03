import { useState, useEffect, useRef } from 'react';
import { 
    ClockIcon, Square3Stack3DIcon, Squares2X2Icon, 
    FireIcon, PaintBrushIcon, GlobeAltIcon, CalendarDaysIcon, ChevronDownIcon
} from '@heroicons/react/24/solid';

import statsService from '../../services/statsService';
import Tabs from '../../components/ui/Tabs'; 
import { MyPieChart, MyBarChart, MyCalendarHeatmap } from '../../components/stats/StatsCharts';

// --- СТИЛІЗОВАНІ КОМПОНЕНТИ ---

const SectionTitle = ({ children }) => (
    <h3 className="text-xl font-bold text-bone font-gothic tracking-wider uppercase mb-6 pl-4 border-l-2 border-blood">
        {children}
    </h3>
);

const KpiCard = ({ icon: Icon, label, value }) => (
    <div className="bg-ash border border-border/50 p-6 rounded-sm shadow-lg shadow-black/50 hover:border-blood/50 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] pt-1">{label}</span>
            <div className="p-2.5 bg-void border border-border rounded-sm text-blood group-hover:text-bone group-hover:border-blood/50 transition-colors shadow-inner">
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </div>
        </div>
        <div className="text-3xl font-bold text-bone font-mono tracking-tight">{value}</div>
    </div>
);

const ChartContainer = ({ title, children }) => (
    <div className="bg-ash border border-border/50 p-6 rounded-sm shadow-lg shadow-black/50 flex flex-col h-full hover:border-blood/30 transition-colors">
        <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 text-center border-b border-border/30 pb-2 font-mono">
            {title}
        </h4>
        <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            {children}
        </div>
    </div>
);

// 👇 КАСТОМНИЙ СЕЛЕКТ (Щоб було красиво і без синього)
const CustomYearSelect = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-sm cursor-pointer border transition-all select-none min-w-[100px] justify-between
                    bg-ash text-xs text-bone font-mono font-bold
                    ${isOpen ? 'border-blood shadow-[0_0_5px_rgba(159,18,57,0.3)]' : 'border-border hover:border-muted'}
                `}
            >
                <span>{selectedLabel}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-full bg-ash border border-border rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`
                                px-4 py-2 text-xs font-mono cursor-pointer transition-colors
                                ${opt.value === value ? 'bg-blood text-white font-bold' : 'text-muted hover:text-bone hover:bg-void'}
                            `}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- ГОЛОВНА СТОРІНКА ---

const StatsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activeTab, setActiveTab] = useState('GLOBAL'); 

    const STATS_TABS = [
        { id: 'GLOBAL', label: (<div className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4" /><span>Global Overview</span></div>) },
        { id: 'YEARLY', label: (<div className="flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4" /><span>Yearly Timeline</span></div>) }
    ];

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // 👇 ПРОСТО ВАНТАЖИМО РІК ЯК Є (Без склеювання з минулим)
                // "Чистий аркуш" для статистики
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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-muted animate-pulse font-mono uppercase tracking-widest">Calculating Data...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center text-blood font-mono uppercase tracking-widest">Error loading statistics</div>;

    const { availableYears, global, yearly } = data;
    const yearOptions = availableYears?.map(y => ({ value: y, label: y.toString() })) || [];

    return (
        <div className="min-h-screen pb-20 font-mono text-bone bg-void">
            <div className="max-w-[1920px] mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border/50 pb-6 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-bone font-gothic tracking-wide mb-2">Statistics</h1>
                        <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold">Analytica & Insights</p>
                    </div>
                    <div className="w-full md:w-auto"><Tabs items={STATS_TABS} activeId={activeTab} onChange={setActiveTab} /></div>
                </div>

                {activeTab === 'GLOBAL' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section>
                            <SectionTitle>General Metrics</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <KpiCard icon={ClockIcon} label="Total Time Spent" value={`${global.kpi.total_time}h`} />
                                <KpiCard icon={Square3Stack3DIcon} label="Total Artifacts" value={global.kpi.total_works} />
                                <KpiCard icon={Squares2X2Icon} label="Total Collections" value={global.kpi.total_collections} />
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Portfolio Structure</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartContainer title="Artifact Status"><MyPieChart data={global.charts.status} nameKey="status" /></ChartContainer>
                                <ChartContainer title="Collection Types"><MyPieChart data={global.charts.collTypes} /></ChartContainer>
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Creative Profile</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ChartContainer title="Genres"><MyPieChart data={global.charts.genres} /></ChartContainer>
                                <ChartContainer title="Styles"><MyPieChart data={global.charts.styles} /></ChartContainer>
                                <ChartContainer title="Materials"><MyPieChart data={global.charts.materials} /></ChartContainer>
                                <ChartContainer title="Tags"><MyPieChart data={global.charts.tags} /></ChartContainer>
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Productivity Dynamics</SectionTitle>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ChartContainer title="Yearly Activity"><MyBarChart data={global.charts.years} color="#9F1239" type="time" unit="h" /></ChartContainer>
                                <ChartContainer title="Monthly Activity"><MyBarChart data={global.charts.months} color="#BE123C" type="time" unit="h" /></ChartContainer>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'YEARLY' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex justify-between items-center bg-ash border border-border/50 p-4 rounded-sm shadow-md">
                            <h2 className="text-lg font-bold text-bone font-gothic tracking-wide uppercase">Year Overview</h2>
                            <div className="w-40">
                                <CustomYearSelect 
                                    options={yearOptions} 
                                    value={selectedYear} 
                                    onChange={setSelectedYear} 
                                />
                            </div>
                        </div>
                        <section>
                            <SectionTitle>Summary of {selectedYear}</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <KpiCard icon={ClockIcon} label={`Time in ${selectedYear}`} value={`${yearly.kpi.total_time}h`} />
                                <KpiCard icon={Square3Stack3DIcon} label={`Artifacts in ${selectedYear}`} value={yearly.kpi.works_count} />
                                <KpiCard icon={Squares2X2Icon} label={`Collections in ${selectedYear}`} value={yearly.kpi.collections_count} />
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Rhythm & Consistency</SectionTitle>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <KpiCard icon={FireIcon} label="Current Streak" value={`${yearly.kpi.current_streak} days`} />
                                    <KpiCard icon={PaintBrushIcon} label="Longest Streak" value={`${yearly.kpi.longest_streak} days`} />
                                </div>
                                <div className="bg-ash border border-border/50 p-6 rounded-sm shadow-lg shadow-black/50 overflow-x-auto">
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 text-center font-mono">Daily Activity Map</h4>
                                    
                                    {/* w-full гарантує, що графік займе всю ширину */}
                                    <div className="min-w-[800px] w-full">
                                        <MyCalendarHeatmap year={selectedYear} values={yearly.heatmap} />
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Progress & Organization</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartContainer title={`Artifact Status (${selectedYear})`}><MyPieChart data={yearly.charts.status} nameKey="status" /></ChartContainer>
                                <ChartContainer title={`Collection Types (${selectedYear})`}><MyPieChart data={yearly.charts.collTypes} /></ChartContainer>
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Yearly Preferences</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ChartContainer title={`Genres (${selectedYear})`}><MyPieChart data={yearly.charts.genres} /></ChartContainer>
                                <ChartContainer title={`Styles (${selectedYear})`}><MyPieChart data={yearly.charts.styles} /></ChartContainer>
                                <ChartContainer title={`Materials (${selectedYear})`}><MyPieChart data={yearly.charts.materials} /></ChartContainer>
                                <ChartContainer title={`Tags (${selectedYear})`}><MyPieChart data={yearly.charts.tags} /></ChartContainer>
                            </div>
                        </section>
                        <section>
                            <SectionTitle>Work Schedule</SectionTitle>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ChartContainer title={`Weekly Rhythm (${selectedYear})`}><MyBarChart data={yearly.charts.days} color="#9F1239" type="time" unit="h" /></ChartContainer>
                                <ChartContainer title={`Daily Routine (${selectedYear})`}><MyBarChart data={yearly.charts.hours} xKey="name" yKey="value" color="#881337" type="number" unit="sess" /></ChartContainer>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsPage;