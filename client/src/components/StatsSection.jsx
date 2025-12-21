import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { 
    FireIcon, ClockIcon, Square3Stack3DIcon, Squares2X2Icon,
    EyeIcon, EyeSlashIcon, GlobeAltIcon, BookmarkIcon
} from '@heroicons/react/24/solid';
import statsService from '../services/statsService';
import userService from '../services/userService'; 
import { useAuth } from '../hooks/useAuth';

const StatsSection = ({ userId, isOwner, privacySettings, onPrivacyChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                
                // 👇 ВАЖЛИВО: Передаємо 'true' третім параметром.
                // Це каже бекенду: "Я на сторінці профілю, дай мені роки від дати РЕЄСТРАЦІЇ".
                const stats = await statsService.getStats(year, userId, true); 
                
                setData(stats);
            } catch (error) {
                console.error("Stats load error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [year, userId]);

    // Логіка перемикання видимості блоку
    const toggleBlock = async (blockKey) => {
        if (!isOwner) return;
        
        // 1. Оновлюємо локально через батьківську функцію (для миттєвої зміни UI)
        const newSettings = { ...privacySettings, [blockKey]: !privacySettings[blockKey] };
        onPrivacyChange(newSettings);

        // 2. Відправляємо на сервер
        try {
            await userService.updateProfile(newSettings);
        } catch (e) {
            console.error("Помилка збереження налаштувань:", e);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse text-xs font-pixel">Завантаження статистики...</div>;
    if (!data) return null;

    const { impact, overview, heatmap, availableYears } = data;

    // Компонент-заглушка для прихованого блоку
    const HiddenBlock = ({ label }) => (
        <div className="bg-slate-900/20 border border-dashed border-slate-800 p-6 rounded-xl text-center text-slate-600 flex flex-col items-center justify-center h-full min-h-[100px]">
            <EyeSlashIcon className="w-6 h-6 mb-2 opacity-50"/>
            <p className="text-xs">Статистика "{label}" прихована автором</p>
        </div>
    );

    // Кнопка перемикання (Око)
    const VisibilityToggle = ({ blockKey }) => {
        if (!isOwner) return null;
        const isVisible = privacySettings[blockKey];
        return (
            <button 
                onClick={() => toggleBlock(blockKey)}
                className={`p-1.5 rounded-md transition ml-2 ${isVisible ? 'text-slate-600 hover:text-white' : 'text-red-500 bg-red-900/10'}`}
                title={isVisible ? "Приховати від інших" : "Показати іншим"}
            >
                {isVisible ? <EyeIcon className="w-4 h-4"/> : <EyeSlashIcon className="w-4 h-4"/>}
            </button>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* === БЛОК 1: ВПЛИВ (GLOBAL IMPACT) === */}
            <div className="relative group">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Вплив</h3>
                    <VisibilityToggle blockKey="show_global_stats" />
                </div>
                
                {(isOwner || privacySettings.show_global_stats) ? (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Перегляди */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <GlobeAltIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white font-mono">{impact.views}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Переглядів колекцій</div>
                            </div>
                        </div>
                        {/* Збереження */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
                                <BookmarkIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white font-mono">{impact.saves}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Збережено іншими</div>
                            </div>
                        </div>
                    </div>
                ) : <HiddenBlock label="Вплив" />}
            </div>

            {/* === БЛОК 2: АКТИВНІСТЬ (ЗА ВЕСЬ ЧАС) === */}
            <div className="relative group">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Активність (За весь час)</h3>
                    <VisibilityToggle blockKey="show_kpi_stats" />
                </div>

                {(isOwner || privacySettings.show_kpi_stats) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MiniKpi icon={Square3Stack3DIcon} label="Всього робіт" value={overview.total_works} color="text-purple-400" />
                        <MiniKpi icon={Squares2X2Icon} label="Всього колекцій" value={overview.total_collections} color="text-indigo-400" />
                        <MiniKpi icon={ClockIcon} label="Годин творчості" value={overview.total_time} color="text-cyan-400" />
                        <MiniKpi icon={FireIcon} label="Макс. стрік" value={overview.longest_streak} color="text-orange-500" />
                    </div>
                ) : <HiddenBlock label="Активність" />}
            </div>

            {/* === БЛОК 3: HEATMAP (КАЛЕНДАР) === */}
            <div className="relative group">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Графік {year}</h3>
                        
                        {/* Дропдаун років (Тут тепер будуть 2023, 2024, 2025) */}
                        <select 
                            value={year} 
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded px-2 py-0.5 outline-none focus:border-cherry-500 cursor-pointer"
                        >
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <VisibilityToggle blockKey="show_heatmap_stats" />
                </div>

                {(isOwner || privacySettings.show_heatmap_stats) ? (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl overflow-x-auto custom-scrollbar">
                        <div className="min-w-[600px]">
                            <CalendarHeatmap
                                startDate={new Date(`${year}-01-01`)}
                                endDate={new Date(`${year}-12-31`)}
                                values={heatmap}
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
                                gutterSize={2}
                            />
                            <ReactTooltip id="stats-tooltip" style={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "4px", fontSize: "10px", padding: "4px 8px" }} />
                        </div>
                    </div>
                ) : <HiddenBlock label="Календар" />}
            </div>

        </div>
    );
};

const MiniKpi = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col items-center justify-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition h-full">
        <Icon className={`w-6 h-6 ${color} mb-2`} />
        <div className="text-2xl font-bold text-white font-mono leading-none mb-1">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase font-bold text-center">{label}</div>
    </div>
);

export default StatsSection;