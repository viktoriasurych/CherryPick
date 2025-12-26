import artworkService from '../../services/artworkService';
import { ClockIcon } from '@heroicons/react/24/outline';
import { formatDuration } from '../../utils/formatters'; // Імпортуємо утиліту

const SessionHistoryList = ({ history, onImageClick }) => {
    
    // Формат 00:00:00 для кожного рядка (залишаємо як є, бо це зручно для логів)
    const formatSessionTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Групування по датах
    const groupedData = history.reduce((acc, session) => {
        const dateObj = new Date(session.end_time);
        // Форматуємо дату англійською для стилю
        const dateKey = dateObj.toLocaleDateString('en-US', {
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
            <div className="text-center py-12 text-muted italic border border-dashed border-border rounded-sm text-xs tracking-wider">
                No rituals recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-4 font-mono">
            {Object.entries(groupedData).map(([date, data]) => (
                <div key={date} className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* ЗАГОЛОВОК ДАТИ */}
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-void/95 backdrop-blur py-3 z-10 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 bg-blood shadow-[0_0_8px_#9f1239]"></div>
                            <span className="text-xs font-bold text-bone uppercase tracking-[0.15em]">
                                {date}
                            </span>
                        </div>
                        {/* Час за день (через утиліту) */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted bg-ash px-2 py-1 rounded-sm border border-border">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatDuration(data.totalSeconds)}</span>
                        </div>
                    </div>

                    {/* СПИСОК СЕСІЙ */}
                    <div className="space-y-1 pl-2 border-l border-border/30 ml-0.5">
                        {data.sessions.map((session) => {
                            const hasPhoto = !!session.note_photo;
                            return (
                                <div 
                                    key={session.session_id} 
                                    className={`
                                        grid gap-4 items-start py-3 px-4 hover:bg-ash/30 transition-colors group relative
                                        ${hasPhoto ? 'grid-cols-[60px_1fr_auto]' : 'grid-cols-[60px_1fr]'}
                                    `}
                                >
                                    {/* Час сесії */}
                                    <div className="text-muted/60 font-bold text-xs pt-0.5 group-hover:text-blood transition-colors">
                                        {formatSessionTime(session.duration_seconds)}
                                    </div>
                                    
                                    {/* Нотатка */}
                                    <div className="text-xs text-muted group-hover:text-bone whitespace-pre-wrap leading-relaxed break-words min-w-0 transition-colors">
                                        {session.note_content || <span className="text-muted/20 italic text-[10px] uppercase tracking-wider">Silent focus</span>}
                                    </div>
                                    
                                    {/* Фото */}
                                    {hasPhoto && (
                                        <div 
                                            onClick={() => onImageClick && onImageClick(session.note_photo)}
                                            className="w-12 h-12 rounded-sm bg-void border border-border overflow-hidden shrink-0 cursor-zoom-in active:scale-95 transition hover:border-blood shadow-sm"
                                        >
                                            <img src={artworkService.getImageUrl(session.note_photo)} alt="Session" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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