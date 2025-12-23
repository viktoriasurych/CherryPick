import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';
import SessionTimer from '../components/SessionTimer';
import SessionHistoryList from '../components/SessionHistoryList';
// 👇 Імпортуємо наш новий компонент
import LoadMoreTrigger from '../components/ui/LoadMoreTrigger';

const ITEMS_PER_LOAD = 5; 

const SessionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [targetArtwork, setTargetArtwork] = useState(null);
    
    const [fullHistory, setFullHistory] = useState([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

    useEffect(() => {
        const init = async () => {
            try {
                const current = await sessionService.getCurrent();
                let artId = id;

                if (current) {
                    setActiveSession(current);
                    artId = current.artwork_id;
                } else if (id) {
                    const artworkData = await artworkService.getById(id);
                    setTargetArtwork(artworkData);
                }

                if (artId) {
                    const hist = await sessionService.getHistory(artId);
                    setFullHistory(hist);
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
            setFullHistory(hist);
        }
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_LOAD);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 animate-pulse">Завантаження...</div>;

    if (!activeSession && !targetArtwork) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-xl font-bold text-white mb-4">Немає активних сеансів</h1>
                <Link to="/projects" className="text-cherry-500 hover:text-cherry-400 font-bold border border-cherry-900/50 px-6 py-2 rounded-full">В архів</Link>
            </div>
        );
    }

    const displayArtwork = activeSession 
        ? { title: activeSession.artwork_title, image_path: activeSession.image_path, id: activeSession.artwork_id }
        : targetArtwork;

    if (!displayArtwork) return null;

    // Підрахунок загального часу (до секунд)
    const getTotalTime = (hist) => {
        const total = hist.reduce((acc, s) => acc + s.duration_seconds, 0);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = Math.floor(total % 60);
        
        // Формуємо рядок типу "12г 30хв 15с" або "45хв 10с"
        let parts = [];
        if (h > 0) parts.push(`${h}г`);
        if (m > 0) parts.push(`${m}хв`);
        parts.push(`${s}с`);
        
        return parts.join(' ');
    };

    const visibleHistory = fullHistory.slice(0, visibleCount);
    const hasMore = visibleCount < fullHistory.length;

    return (
        <div className="min-h-screen bg-black text-bone-200 flex flex-col relative overflow-hidden font-sans">
            
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <img src={artworkService.getImageUrl(displayArtwork.image_path)} className="w-full h-full object-cover blur-[100px] scale-125" />
                <div className="absolute inset-0 bg-black/70"></div>
            </div>

            <header className="relative z-20 flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <Link to={`/projects/${displayArtwork.id}`} className="flex items-center gap-3 group max-w-[80%]">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-cherry-500 transition shrink-0">
                        <img src={artworkService.getImageUrl(displayArtwork.image_path)} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-sm md:text-base font-bold text-white truncate group-hover:text-cherry-400 transition">{displayArtwork.title}</h1>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowLeftIcon className="w-3 h-3" /> Назад до перегляду</span>
                    </div>
                </Link>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <SessionTimer initialSession={activeSession} artworkId={displayArtwork.id} onSessionSaved={handleSessionSaved} />
                </div>
            </main>

            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-0 h-[45vh] flex flex-col">
                {/* Заголовок історії */}
                <div className="sticky top-0 bg-black/80 backdrop-blur py-3 z-20 mb-2 flex justify-between items-center px-2 border-b border-white/10 shrink-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Історія ({fullHistory.length})
                    </h3>
                    <span className="text-[10px] font-mono text-cherry-500 bg-cherry-900/10 px-2 py-0.5 rounded border border-cherry-900/30">
                        Σ {getTotalTime(fullHistory)}
                    </span>
                </div>
                
                {/* Список з прокруткою */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 mask-image-b-fade">
                    <SessionHistoryList history={visibleHistory} onImageClick={null} />
                    
                    {/* 👇 ВИКОРИСТОВУЄМО НАШ НОВИЙ КОМПОНЕНТ */}
                    <LoadMoreTrigger 
                        hasMore={hasMore} 
                        onLoadMore={handleLoadMore} 
                        totalLoaded={visibleHistory.length}
                        totalItems={fullHistory.length}
                    />
                </div>
            </div>
        </div>
    );
};

export default SessionPage;