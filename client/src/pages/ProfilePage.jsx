import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import statsService from '../services/statsService';
import collectionService from '../services/collectionService';
import Button from '../components/ui/Button';
import { 
    MapPinIcon, LinkIcon, EnvelopeIcon, PaperAirplaneIcon, 
    CameraIcon, PaintBrushIcon,
    ClockIcon, Square3Stack3DIcon, Squares2X2Icon, FireIcon
} from '@heroicons/react/24/solid';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import defaultAvatar from '../assets/default-avatar.png'; 

const ProfilePage = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    // Функція для "очищення" посилань (видаляє https://, www і слеш в кінці)
    const formatUrl = (url) => {
        if (!url) return '';
        return url.replace(/(^\w+:|^)\/\//, '').replace('www.', '').replace(/\/$/, '');
    };

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    setLoading(true);
                    
                    // 1. Завантажуємо статистику
                    const stats = await statsService.getStats(selectedYear);
                    setStatsData(stats);

                    // 2. Завантажуємо колекції
                    const cols = await collectionService.getAll(); 
                    setCollections(cols); 
                } catch (error) {
                    console.error("Error loading profile data", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [user, selectedYear]);

    const avatarSrc = user?.avatar_url 
        ? `http://localhost:3000${user.avatar_url}` 
        : defaultAvatar;

    // Безпечний доступ до даних (щоб не впало, поки вантажиться)
    const kpi = statsData?.yearly?.kpi || {};
    const heatmapValues = statsData?.yearly?.heatmap || [];

    return (
        <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* =================================================================================
                                                ЛІВА КОЛОНКА (САЙДБАР ПРОФІЛЮ)
                   ================================================================================= */}
                <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-6">
                    
                    {/* Аватар + Основне інфо */}
                    <div className="flex flex-col gap-4">
                        <div className="w-64 h-64 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl mx-auto lg:mx-0 bg-slate-900 shrink-0">
                            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="text-center lg:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-white font-pixel tracking-wide break-words">
                                {user?.nickname}
                            </h1>
                            <p className="text-slate-400 text-lg whitespace-pre-wrap break-words leading-relaxed">
                                {user?.bio || "Опис відсутній"}
                            </p>
                        </div>

                        <Link to="/profile/edit" className="w-full">
                            <Button 
                                text="Редагувати профіль" 
                                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 justify-center"
                            />
                        </Link>

                        {/* Мета-дані: Локація, Сайт, Пошта */}
                        <div className="space-y-3 pt-4 border-t border-slate-800 text-sm text-slate-400">
                            {user?.location && (
                                <div className="flex items-start gap-2">
                                    <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span className="break-words">{user.location}</span>
                                </div>
                            )}
                            
                            {user?.social_website && (
                                <div className="flex items-start gap-2">
                                    <LinkIcon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                    <a 
                                        href={user.social_website} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="hover:text-cherry-400 text-blue-400 font-medium transition-colors break-all"
                                    >
                                        {formatUrl(user.social_website)}
                                    </a>
                                </div>
                            )}

                            {user?.contact_email && (
                                <div className="flex items-center gap-2">
                                    <EnvelopeIcon className="w-4 h-4 text-slate-500 shrink-0" />
                                    <a href={`mailto:${user.contact_email}`} className="hover:text-white break-all transition-colors">
                                        {user.contact_email}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Соцмережі (Тільки іконки) */}
                        <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                            {user?.social_telegram && <SocialIcon href={`https://t.me/${user.social_telegram.replace('@','')}`} icon={PaperAirplaneIcon} tooltip="Telegram" />}
                            {user?.social_instagram && <SocialIcon href={user.social_instagram} icon={CameraIcon} tooltip="Instagram" />}
                            {user?.social_artstation && <SocialIcon href={user.social_artstation} text="AS" tooltip="ArtStation" />}
                            {user?.social_behance && <SocialIcon href={user.social_behance} icon={PaintBrushIcon} tooltip="Behance" />}
                        </div>
                    </div>
                </div>


                {/* =================================================================================
                                                ПРАВА КОЛОНКА (КОНТЕНТ)
                   ================================================================================= */}
                <div className="lg:col-span-9 space-y-10">
                    
                    {/* --- БЛОК 1: ОГЛЯД АКТИВНОСТІ (KPI) --- */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Огляд активності</h3>
                             
                             {/* Випадаючий список років */}
                             <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-cherry-500 cursor-pointer"
                             >
                                 {statsData?.availableYears?.map(y => (
                                     <option key={y} value={y}>{y}</option>
                                 ))}
                             </select>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MiniKpi icon={Square3Stack3DIcon} label="Робіт" value={kpi.works_count || 0} color="text-purple-400" />
                            <MiniKpi icon={Squares2X2Icon} label="Колекцій" value={kpi.collections_count || 0} color="text-pink-400" />
                            <MiniKpi icon={ClockIcon} label="Час (год)" value={Math.round(kpi.total_time || 0)} color="text-blue-400" />
                            <MiniKpi icon={FireIcon} label="Стрік (днів)" value={kpi.current_streak || 0} color="text-orange-500" />
                        </div>
                    </div>


                    {/* --- БЛОК 2: HEATMAP (ГРАФІК МАЛЮВАННЯ) --- */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white font-pixel">Графік малювання</h3>
                        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl overflow-x-auto">
                            <div className="min-w-[700px]">
                                <CalendarHeatmap
                                    startDate={new Date(`${selectedYear}-01-01`)}
                                    endDate={selectedYear === new Date().getFullYear() ? new Date() : new Date(`${selectedYear}-12-31`)}
                                    values={heatmapValues}
                                    classForValue={(value) => {
                                        if (!value) return 'color-empty';
                                        if (value.count < 30) return 'color-scale-1';
                                        if (value.count < 60) return 'color-scale-2';
                                        if (value.count < 120) return 'color-scale-3';
                                        return 'color-scale-4';
                                    }}
                                    tooltipDataAttrs={value => ({
                                        'data-tooltip-content': value.date ? `${value.date}: ~${Math.round(value.count)} хв` : 'Немає даних',
                                        'data-tooltip-id': 'heatmap-tooltip'
                                    })}
                                    showWeekdayLabels
                                    gutterSize={3}
                                />
                                <ReactTooltip id="heatmap-tooltip" style={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: "12px" }} />
                            </div>
                        </div>
                    </div>


                    {/* --- БЛОК 3: КОЛЕКЦІЇ --- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white font-pixel">Мої колекції</h3>
                        </div>

                        {collections.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500">
                                У вас ще немає колекцій.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {collections.map(col => (
                                    <div key={col.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4 hover:border-slate-600 transition group h-full">
                                        <div className="w-16 h-16 bg-slate-950 rounded flex items-center justify-center text-2xl border border-slate-800 shrink-0">
                                            🍒
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            {/* Назва переноситься */}
                                            <Link to={`/collections/${col.id}`} className="font-bold text-slate-200 hover:text-cherry-400 transition break-words leading-tight mb-1">
                                                {col.title}
                                            </Link>
                                            
                                            {/* Опис переноситься */}
                                            <p className="text-xs text-slate-500 break-words whitespace-pre-wrap mb-2">
                                                {col.description || 'Без опису'}
                                            </p>
                                            
                                            <div className="mt-auto pt-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${col.type === 'EXHIBITION' ? 'bg-purple-900 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                                                    {col.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- ДОПОМІЖНІ КОМПОНЕНТИ ---

const SocialIcon = ({ href, icon: Icon, text, tooltip }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        title={tooltip}
        className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition border border-slate-700 shrink-0"
    >
        {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">{text}</span>}
    </a>
);

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

export default ProfilePage;