import artworkService from '../services/artworkService';
import { ClockIcon } from '@heroicons/react/24/outline';

const SessionHistoryList = ({ history, onImageClick }) => {
    
    // 1. Формат 00:00:00 (для кожного рядка - вже є)
    const formatDuration = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // 2. 👇 ОНОВЛЕНО: Формат для підсумків дня (з секундами)
    const formatTotalDuration = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        
        let result = [];
        if (h > 0) result.push(`${h} год`);
        if (m > 0) result.push(`${m} хв`);
        if (s > 0 || result.length === 0) result.push(`${s} с`); // Показуємо секунди завжди, якщо вони є
        
        return result.join(' ');
    };

    // 3. Групування
    const groupedData = history.reduce((acc, session) => {
        const dateObj = new Date(session.end_time);
        const dateKey = dateObj.toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        if (!acc[dateKey]) {
            acc[dateKey] = { sessions: [], totalSeconds: 0 };
        }
        
        acc[dateKey].sessions.push(session);
        acc[dateKey].totalSeconds += session.duration_seconds;
        
        return acc;
    }, {});

    if (history.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 italic border border-dashed border-slate-800 rounded-lg">
                Історія поки порожня.
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-4"> {/* pb-4 щоб був відступ перед кнопкою Load More */}
            {Object.entries(groupedData).map(([date, data]) => (
                <div key={date} className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* ЗАГОЛОВОК ДАТИ */}
                    <div className="flex items-center justify-between mb-3 sticky top-0 bg-slate-950/95 backdrop-blur py-2 z-10 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-cherry-500 shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                                {date}
                            </span>
                        </div>
                        {/* Час за день (тепер з секундами) */}
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatTotalDuration(data.totalSeconds)}</span>
                        </div>
                    </div>

                    {/* СПИСОК */}
                    <div className="space-y-2 pl-2">
                        {data.sessions.map((session) => {
                            const hasPhoto = !!session.note_photo;
                            return (
                                <div 
                                    key={session.session_id} 
                                    className={`
                                        grid gap-4 items-start py-3 px-3 border-l-2 border-slate-800 hover:border-slate-600 hover:bg-white/5 rounded-r-lg transition-colors
                                        ${hasPhoto ? 'grid-cols-[70px_1fr_auto]' : 'grid-cols-[70px_1fr]'}
                                    `}
                                >
                                    <div className="text-slate-400 font-mono text-xs font-bold pt-1">
                                        {formatDuration(session.duration_seconds)}
                                    </div>
                                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed break-words min-w-0">
                                        {session.note_content || <span className="text-slate-600 italic text-xs">—</span>}
                                    </div>
                                    {hasPhoto && (
                                        <div 
                                            onClick={() => onImageClick && onImageClick(session.note_photo)}
                                            className="w-14 h-14 rounded-lg bg-black border border-slate-700 overflow-hidden shrink-0 cursor-zoom-in active:scale-95 transition hover:border-cherry-500/50"
                                        >
                                            <img src={artworkService.getImageUrl(session.note_photo)} alt="Session" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SessionHistoryList;