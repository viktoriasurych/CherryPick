import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import artworkService from '../../services/artworkService';
import sessionService from '../../services/sessionService';
import SessionTimer from '../../components/session/SessionTimer';
import SessionHistoryList from '../../components/session/SessionHistoryList';
import LoadMoreTrigger from '../../components/ui/LoadMoreTrigger';
import { formatDuration } from '../../utils/formatters';

import Loader from '../../components/ui/Loader';
import PageTitle from '../../components/shared/PageTitle';

import sleepingCatGif from '../../assets/sleeping-cat.gif'; 
import defaultPlaceholder from '../../assets/default-art.png';

const ITEMS_PER_LOAD = 5; 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SessionPage = () => {
    const { id } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [targetArtwork, setTargetArtwork] = useState(null);
    const [fullHistory, setFullHistory] = useState([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
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
                console.error("Session init error:", error); 
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

    const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_LOAD);

    const getArtImage = (path) => {
        if (!path) return defaultPlaceholder;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_URL}${cleanPath}`;
    };

    if (loading) return <Loader />;

    if (!activeSession && !targetArtwork) {
        return (
            <div className="min-h-screen bg-void flex flex-col text-bone font-mono">
                <PageTitle title="The Void" />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center -mt-10 animate-in fade-in duration-700"> 
                    <img src={sleepingCatGif} alt="Void" className="h-32 md:h-40 object-contain mb-6 opacity-80" />
                    <h1 className="text-xl font-gothic text-blood uppercase tracking-widest mb-6">No Active Sessions</h1>
                    <Link to="/projects" className="text-xs font-bold text-bone border border-white/20 px-8 py-3 hover:bg-white/5 hover:border-white/40 transition-all uppercase tracking-widest rounded-sm">
                        Select a Project
                    </Link>
                </div>
            </div>
        );
    }

    const displayArtwork = activeSession 
        ? { title: activeSession.artwork_title, image_path: activeSession.image_path, id: activeSession.artwork_id }
        : targetArtwork;

    if (!displayArtwork) return null;

    const formattedTotalTime = formatDuration(fullHistory.reduce((acc, s) => acc + s.duration_seconds, 0));
    const visibleHistory = fullHistory.slice(0, visibleCount);
    const hasMore = visibleCount < fullHistory.length;

    return (
        <div className="min-h-screen bg-void text-bone flex flex-col font-mono pb-10 md:pb-0 overflow-x-hidden">
            <PageTitle title={`Session | ${displayArtwork.title}`} />

            <header className="w-full border-b border-white/10 sticky top-0 z-30 bg-void/95 backdrop-blur-sm">
                <div className="w-full max-w-480 mx-auto px-4 py-3">
                    <Link 
                        to={`/projects/${displayArtwork.id}`} 
                        className="grid grid-cols-[auto_1fr] gap-3 items-center w-full group"
                    >
                        <div className="w-10 h-10 rounded-sm overflow-hidden border border-white/10 group-hover:border-blood transition bg-ash">
                            <img 
                                src={getArtImage(displayArtwork.image_path)} 
                                className="w-full h-full object-cover transition duration-500" 
                                alt="Art"
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultPlaceholder; }} 
                            />
                        </div>

                        {/* назва картини */}
                        <div className="min-w-0 overflow-hidden">
                            <h1 className="text-xs md:text-base font-gothic uppercase tracking-widest text-bone group-hover:text-blood transition truncate w-full block">
                                {displayArtwork.title}
                            </h1>
                            <span className="text-[10px] text-muted flex items-center gap-1 uppercase tracking-wider group-hover:text-bone transition-colors mt-0.5 truncate w-full">
                                <ArrowLeftIcon className="w-3 h-3 shrink-0" /> Back to details
                            </span>
                        </div>
                    </Link>
                </div>
            </header>

            {/* сам таймер */}
            <div className="flex-1 flex flex-col lg:flex-row w-full max-w-480 mx-auto overflow-hidden">
                <div className="flex-none lg:flex-1 flex items-start justify-center p-4 pt-8 lg:items-center w-full">
                    <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
                        <SessionTimer 
                            initialSession={activeSession} 
                            artworkId={displayArtwork.id} 
                            artworkTitle={displayArtwork.title} 
                            onSessionSaved={handleSessionSaved} 
                        />
                    </div>
                </div>

                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col mt-4 lg:mt-0 bg-void">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center shrink-0 bg-ash/20">
                        <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">History</h3>
                        <span className="text-[10px] font-mono text-blood bg-blood/5 px-2 py-0.5 border border-blood/20 rounded">
                            {formattedTotalTime}
                        </span>
                    </div>
                    
                    <div className="h-75 lg:h-[calc(100vh-130px)] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/10">
                        <SessionHistoryList history={visibleHistory} />
                        <div className="mt-4 flex justify-center pb-6">
                             <LoadMoreTrigger 
                                hasMore={hasMore} 
                                onLoadMore={handleLoadMore} 
                                totalLoaded={visibleHistory.length} 
                                totalItems={fullHistory.length} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionPage;