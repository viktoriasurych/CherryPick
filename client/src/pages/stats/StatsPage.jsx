import { useState, useEffect } from 'react';
import { FireIcon, ClockIcon, Square3Stack3DIcon, Squares2X2Icon, PaintBrushIcon } from '@heroicons/react/24/solid';

import statsService from '../../services/statsService';
import Tabs from '../../components/ui/Tabs'; 
import SearchableSelect from '../../components/ui/SearchableSelect';

// Імпорти UI
import { SectionTitle, KpiCard, ChartContainer } from '../../components/stats/StatsUI';
// Імпорти графіків
import { MyPieChart, MyBarChart, MyCalendarHeatmap } from '../../components/stats/StatsCharts';

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
                            <ChartContainer title="Статус робіт"><MyPieChart data={global.charts.status} nameKey="status" /></ChartContainer>
                            <ChartContainer title="Види збірок"><MyPieChart data={global.charts.collTypes} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Творчий профіль</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ChartContainer title="Жанри"><MyPieChart data={global.charts.genres} /></ChartContainer>
                            <ChartContainer title="Стилі"><MyPieChart data={global.charts.styles} /></ChartContainer>
                            <ChartContainer title="Матеріали"><MyPieChart data={global.charts.materials} /></ChartContainer>
                            <ChartContainer title="Теги"><MyPieChart data={global.charts.tags} /></ChartContainer>
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
                            
                            {/* 👇 ТУТ ТЕПЕР ВИКОРИСТОВУЄТЬСЯ СПІЛЬНИЙ КОМПОНЕНТ */}
                            <MyCalendarHeatmap year={selectedYear} values={yearly.heatmap} />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Прогрес та Організація</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartContainer title={`Статус робіт (${selectedYear})`}><MyPieChart data={yearly.charts.status} nameKey="status" /></ChartContainer>
                            <ChartContainer title={`Типи колекцій (${selectedYear})`}><MyPieChart data={yearly.charts.collTypes} /></ChartContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle>Вподобання року</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ChartContainer title={`Жанри (${selectedYear})`}><MyPieChart data={yearly.charts.genres} /></ChartContainer>
                            <ChartContainer title={`Стилі (${selectedYear})`}><MyPieChart data={yearly.charts.styles} /></ChartContainer>
                            <ChartContainer title={`Матеріали (${selectedYear})`}><MyPieChart data={yearly.charts.materials} /></ChartContainer>
                            <ChartContainer title={`Теги (${selectedYear})`}><MyPieChart data={yearly.charts.tags} /></ChartContainer>
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

export default StatsPage;