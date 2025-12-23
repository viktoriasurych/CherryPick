import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; 
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';
import SessionTimer from '../components/SessionTimer';

const SessionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [targetArtwork, setTargetArtwork] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                const current = await sessionService.getCurrent();
                
                if (current) {
                    setActiveSession(current);
                    const hist = await sessionService.getHistory(current.artwork_id);
                    setHistory(hist);
                } else if (id) {
                    const artworkData = await artworkService.getById(id);
                    setTargetArtwork(artworkData);
                    const hist = await sessionService.getHistory(id);
                    setHistory(hist);
                } 
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const handleSessionSaved = async () => {
        const artworkId = activeSession?.artwork_id || targetArtwork?.id;
        if (artworkId) {
            const hist = await sessionService.getHistory(artworkId);
            setHistory(hist);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 animate-pulse">Завантаження...</div>;

    // Якщо нічого немає
    if (!activeSession && !targetArtwork) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-xl font-bold text-white mb-4">Немає активних сеансів</h1>
                <Link to="/projects" className="text-cherry-500 hover:text-cherry-400 font-bold border border-cherry-900/50 px-6 py-2 rounded-full">
                    В архів
                </Link>
            </div>
        );
    }

    const displayArtwork = activeSession 
        ? { title: activeSession.artwork_title, image_path: activeSession.image_path, id: activeSession.artwork_id }
        : targetArtwork;

    if (!displayArtwork) return null;

    // Форматування для історії
    const formatDurationHistory = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}год ${m}хв` : `${m} хв`;
    };

    return (
        <div className="min-h-screen bg-black text-bone-200 flex flex-col relative overflow-hidden font-sans">
            
            {/* ФОН (Дуже темний і розмитий) */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <img 
                    src={artworkService.getImageUrl(displayArtwork.image_path)} 
                    className="w-full h-full object-cover blur-[100px] scale-125"
                />
                <div className="absolute inset-0 bg-black/70"></div>
            </div>

            {/* 1. ХЕДЕР (Компактний рядок) */}
            <header className="relative z-20 flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <Link 
                    to={`/projects/${displayArtwork.id}`} 
                    className="flex items-center gap-3 group max-w-[80%]"
                >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-cherry-500 transition shrink-0">
                        <img 
                            src={artworkService.getImageUrl(displayArtwork.image_path)} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-sm md:text-base font-bold text-white truncate group-hover:text-cherry-400 transition">
                            {displayArtwork.title}
                        </h1>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <ArrowLeftIcon className="w-3 h-3" /> Назад до перегляду
                        </span>
                    </div>
                </Link>
            </header>

            {/* 2. ЦЕНТР (Таймер-віджет) */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <SessionTimer 
                        initialSession={activeSession}
                        artworkId={displayArtwork.id} 
                        onSessionSaved={handleSessionSaved}
                    />
                </div>
            </main>

            {/* 3. НИЗ (Історія - Scrollable area) */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-8 h-[30vh]">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Історія сеансів</h3>
                
                <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 mask-image-b-fade">
                    {history.length === 0 ? (
                        <div className="text-center text-slate-600 text-sm py-4">Пусто...</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map(session => (
                                <div key={session.session_id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition">
                                    <div className="text-cherry-400 font-mono font-bold w-16 text-right shrink-0">
                                        {formatDurationHistory(session.duration_seconds)}
                                    </div>
                                    <div className="h-4 w-px bg-white/10"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-300 truncate">
                                            {session.note_content || "Без нотатки"}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(session.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {session.note_photo && (
                                        <div className="w-8 h-8 rounded bg-black overflow-hidden shrink-0 border border-white/10">
                                            <img src={artworkService.getImageUrl(session.note_photo)} className="w-full h-full object-cover"/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionPage;