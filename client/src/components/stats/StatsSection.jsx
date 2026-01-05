import { useState, useEffect } from 'react';
import { 
    FireIcon, ClockIcon, Square3Stack3DIcon, Squares2X2Icon,
    EyeIcon, EyeSlashIcon, GlobeAltIcon, BookmarkIcon, LockClosedIcon
} from '@heroicons/react/24/solid';

import statsService from '../../services/statsService';
import userService from '../../services/userService'; 
import { MyCalendarHeatmap } from '../stats/StatsCharts';

import Select from '../ui/Select'; 
import { formatDuration } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-ash border border-border/50 p-4 rounded-sm shadow-md transition-all group flex items-center gap-4 hover:border-blood/50">
        <div className="p-2.5 bg-void border border-border rounded-sm text-blood transition-colors shadow-inner shrink-0 group-hover:border-blood/50 group-hover:shadow-[0_0_10px_rgba(159,18,57,0.15)]">
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="flex flex-col">
            <span className="text-xl font-bold text-bone font-mono tracking-tight leading-none">{value}</span>
            <span className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] mt-1">{label}</span>
        </div>
    </div>
);

const HiddenBlock = ({ label }) => (
    <div className="bg-void/50 border border-dashed border-border/50 p-8 rounded-sm flex flex-col items-center justify-center text-muted gap-2 shadow-inner">
        <LockClosedIcon className="w-6 h-6 opacity-50" />
        <span className="text-[10px] uppercase tracking-widest font-bold">{label} is Private</span>
    </div>
);

const SectionHeader = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4 border-l-2 border-blood pl-3">
        <h3 className="text-sm font-bold text-bone font-gothic tracking-widest uppercase">{title}</h3>
        {action}
    </div>
);

const StatsSection = ({ userId, isOwner, privacySettings, onPrivacyChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                const currentYear = new Date().getFullYear();
                
                const mainStats = await statsService.getStats(year, userId, true); 
                
                let finalHeatmap = mainStats.heatmap || [];

                if (year === currentYear) {
                    try {
                        const prevYearStats = await statsService.getStats(year - 1, userId, true);
                        if (prevYearStats && prevYearStats.heatmap && prevYearStats.heatmap.length > 0) {
                            finalHeatmap = [...prevYearStats.heatmap, ...finalHeatmap];
                        }
                    } catch (prevErr) {
                        console.warn("Could not load previous year stats:", prevErr);
                    }
                }

                // 3. Зберігаємо
                setData({ 
                    ...mainStats, 
                    heatmap: finalHeatmap 
                });

            } catch (error) {
                console.error("Stats load error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [year, userId]);

    const toggleBlock = async (blockKey) => {
        if (!isOwner) return;
        const newValue = !privacySettings[blockKey];
        onPrivacyChange(blockKey, newValue);
        try {
            await userService.updateProfile({ ...privacySettings, [blockKey]: newValue });
        } catch (e) {
            console.error("Error updating privacy:", e);
            onPrivacyChange(blockKey, !newValue); 
        }
    };

    const VisibilityToggle = ({ blockKey }) => {
        if (!isOwner) return null;
        const isVisible = privacySettings[blockKey];
        return (
            <button 
                onClick={() => toggleBlock(blockKey)}
                className={`p-1.5 rounded-sm transition ml-2 border border-transparent ${isVisible ? 'text-muted hover:text-bone' : 'text-blood border-blood/20 bg-blood/10'}`}
                title={isVisible ? "Hide from public" : "Show to public"}
            >
                {isVisible ? <EyeIcon className="w-4 h-4"/> : <EyeSlashIcon className="w-4 h-4"/>}
            </button>
        );
    };

    if (loading) return <div className="p-10 text-center text-muted animate-pulse text-[10px] font-mono uppercase tracking-widest">Calculus...</div>;
    if (!data) return null;

    const { impact, overview, heatmap, availableYears } = data;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-mono">
            
            <div className="relative group">
                <SectionHeader title="Impact & Reach" action={<VisibilityToggle blockKey="show_global_stats" />} />
                {(isOwner || privacySettings.show_global_stats) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard icon={GlobeAltIcon} label="Total Views" value={impact.views} />
                        <StatCard icon={BookmarkIcon} label="Saved by Others" value={impact.saves} />
                    </div>
                ) : <HiddenBlock label="Impact Data" />}
            </div>

            {/* активність */}
            <div className="relative group">
                <SectionHeader title="Total Activity" action={<VisibilityToggle blockKey="show_kpi_stats" />} />
                {(isOwner || privacySettings.show_kpi_stats) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={Square3Stack3DIcon} label="Artworks" value={overview.total_works} />
                        <StatCard icon={Squares2X2Icon} label="Collections" value={overview.total_collections} />
                        <StatCard icon={ClockIcon} label="Hours Spent" value={overview.total_time} />
                        <StatCard icon={FireIcon} label="Current Streak" value={`${overview.current_streak || 0} days`} />
                    </div>
                ) : <HiddenBlock label="Activity Stats" />}
            </div>

            {/* HEATMAP */}
            <div className="relative group">
                <div className="flex items-center justify-between mb-4 border-l-2 border-blood pl-3">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold text-bone font-gothic tracking-widest uppercase">
                            Consistency
                        </h3>
                        <div className="w-24">
                            <Select 
                                value={year}
                                options={availableYears.map(y => ({ value: y, label: String(y) }))}
                                onChange={(val) => setYear(Number(val))}
                                className="text-[10px]"
                            />
                        </div>
                    </div>
                    <VisibilityToggle blockKey="show_heatmap_stats" />
                </div>

                {(isOwner || privacySettings.show_heatmap_stats) ? (
                    <div className="bg-ash border border-border/50 p-6 rounded-sm shadow-md overflow-x-auto">
                        <div className="min-w-150 w-full">
                            <MyCalendarHeatmap year={year} values={heatmap} />
                        </div>
                    </div>
                ) : <HiddenBlock label="Calendar Map" />}
            </div>
        </div>
    );
};

export default StatsSection;