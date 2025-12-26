import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    BookmarkIcon, InformationCircleIcon, 
    Squares2X2Icon, PencilSquareIcon, PlayIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';

import artworkService from '../../services/artworkService';
import sessionService from '../../services/sessionService';
import collectionService from '../../services/collectionService';

import AddToCollectionModal from '../../components/collections/AddToCollectionModal';
import Tabs from '../../components/ui/Tabs';
import AtmosphereImage from '../../components/ui/AtmosphereImage';
import BackButton from '../../components/ui/BackButton';
import LoadMoreTrigger from '../../components/ui/LoadMoreTrigger';
import ArtworkInfoPanel from '../../components/projects/ArtworkInfoPanel';
import SessionHistoryList from '../../components/session/SessionHistoryList';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { ART_STATUSES } from '../../config/constants';

const ITEMS_PER_LOAD = 5; 

// 👇 Внутрішній компонент для статусу (щоб не було синього кольору)
const StatusDropdown = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLabel = options[value] || value;

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Status</div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 w-[160px] bg-void border border-border px-3 py-2 rounded-sm text-xs font-bold text-bone uppercase tracking-wider hover:border-blood transition-colors"
            >
                <span className="truncate">{currentLabel}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-[160px] bg-ash border border-border rounded-sm shadow-xl z-50 overflow-hidden">
                    {Object.entries(options).map(([key, label]) => (
                        <div 
                            key={key}
                            onClick={() => { onChange(key); setIsOpen(false); }}
                            className={`
                                px-3 py-2 text-xs cursor-pointer uppercase tracking-wider transition-colors
                                ${key === value ? 'text-blood font-bold bg-blood/10' : 'text-muted hover:text-bone hover:bg-void'}
                            `}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectDetailsPage = () => {
    const { id } = useParams();
    
    const [artwork, setArtwork] = useState(null);
    const [fullHistory, setFullHistory] = useState([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
    const [inCollections, setInCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('INFO');

    const [isStatusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const fileInputRef = useRef(null);

    const PROJECT_TABS = [
        { id: 'INFO', label: 'Details' },
        { id: 'HISTORY', label: 'Rituals' },
        { id: 'COLLECTIONS', label: 'Grimoires' }
    ];

    const fetchAllData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [artData, historyData, collectionsIds] = await Promise.all([
                artworkService.getById(id),
                sessionService.getHistory(id),
                collectionService.getCollectionsByArtwork(id)
            ]);

            setArtwork(artData);
            setFullHistory(historyData); 

            if (collectionsIds.length > 0) {
                const allCols = await collectionService.getAll();
                const connectedParams = new Set(collectionsIds);
                setInCollections(allCols.filter(c => connectedParams.has(c.id)));
            } else {
                setInCollections([]);
            }

            if (!isSilent && !selectedImage) {
                setSelectedImage(artData.image_path);
            }
        } catch (error) {
            console.error("Load error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [id]);

    const executeStatusChange = async (newStatus) => {
        try {
            setArtwork(prev => ({ ...prev, status: newStatus }));
            
            let finishedData = null;
            if (newStatus === 'FINISHED' || newStatus === 'DROPPED') {
                const t = new Date();
                finishedData = { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
            } else {
                finishedData = { year: '', month: '', day: '' };
            }
            
            await artworkService.updateStatus(id, newStatus, finishedData);
            fetchAllData(true); 
        } catch (error) {
            alert("Status update failed");
        }
    };

    const onStatusSelectChange = (newStatus) => {
        if (
            (artwork.status === 'FINISHED' || artwork.status === 'DROPPED') && 
            newStatus !== 'FINISHED' && 
            newStatus !== 'DROPPED' &&
            inCollections.length > 0
        ) {
            setPendingStatus(newStatus);
            setStatusConfirmOpen(true);
        } else {
            executeStatusChange(newStatus);
        }
    };

    const handleConfirmStatusChange = () => {
        executeStatusChange(pendingStatus);
        setStatusConfirmOpen(false);
        setPendingStatus(null);
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await artworkService.addGalleryImage(id, file, 'Detail');
            fetchAllData(true);
        } catch (error) {
            alert('Upload failed');
        }
    };

    const handleHistoryImageClick = (src) => {
        setSelectedImage(src);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoadMoreHistory = () => {
        setVisibleCount(prev => prev + ITEMS_PER_LOAD);
    };

    const getTotalTime = (hist) => {
        const total = hist.reduce((acc, s) => acc + s.duration_seconds, 0);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    if (loading) return <div className="text-center text-muted mt-20 font-mono text-xs uppercase tracking-widest animate-pulse">Summoning data...</div>;
    if (!artwork) return null;

    const allImages = [];
    const addedPaths = new Set();

    if (artwork.image_path) {
        allImages.push({ id: 'cover_main', src: artwork.image_path, type: 'Cover', isCover: true });
        addedPaths.add(artwork.image_path);
    }

    if (artwork.gallery) {
        artwork.gallery.forEach(img => {
            if (!addedPaths.has(img.image_path)) {
                allImages.push({ id: `gal_${img.id}`, src: img.image_path, type: 'Detail' });
                addedPaths.add(img.image_path);
            }
        });
    }

    const currentSrc = selectedImage || artwork.image_path;
    const visibleHistory = fullHistory.slice(0, visibleCount);
    const hasMoreHistory = visibleCount < fullHistory.length;
    const isActiveStatus = ['PLANNED', 'SKETCH', 'IN_PROGRESS'].includes(artwork.status);

    return (
        // 👇 ЗМЕНШИВ ШИРИНУ: max-w-6xl (було 7xl)
        <div className="p-4 md:p-8 relative min-h-screen max-w-6xl mx-auto font-mono">
            
            <div className="mb-8">
                <BackButton label="Archive" fallbackPath="/projects" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* === ЛІВА КОЛОНКА (Фото) === */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Головне фото - Чітке, без блюру, рамка */}
                    <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-ash border border-border shadow-2xl">
                        <AtmosphereImage 
                            src={artworkService.getImageUrl(currentSrc)} 
                            alt="Selected Artwork" 
                            className="w-full h-full object-contain" // object-contain щоб бачити всю картину
                        />
                    </div>

                    {/* Стрічка мініатюр */}
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="min-w-[70px] h-[90px] bg-void border border-dashed border-border hover:border-blood rounded-sm flex flex-col items-center justify-center text-muted hover:text-blood transition cursor-pointer group shrink-0"
                        >
                            <span className="text-xl group-hover:scale-110 transition">+</span>
                            <input type="file" ref={fileInputRef} onChange={handleGalleryUpload} className="hidden" />
                        </div>

                        {allImages.map((img) => {
                            const isSelected = currentSrc === img.src;
                            return (
                                <div 
                                    key={img.id} 
                                    onClick={() => setSelectedImage(img.src)} 
                                    className="min-w-[70px] w-[70px] flex flex-col gap-1 cursor-pointer group shrink-0"
                                >
                                    <div className={`
                                        h-[70px] w-full rounded-sm overflow-hidden border transition-all relative bg-black
                                        ${isSelected ? 'border-blood ring-1 ring-blood' : 'border-transparent opacity-60 hover:opacity-100'}
                                    `}>
                                        <img src={artworkService.getImageUrl(img.src)} alt={img.type} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[9px] text-center uppercase tracking-wider truncate px-1 ${isSelected ? 'text-bone font-bold' : 'text-muted'}`}>
                                        {img.type}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === ПРАВА КОЛОНКА (Інфо) === */}
                <div className="lg:col-span-5 flex flex-col h-full min-w-0"> {/* min-w-0 важливо для truncate */}
                    
                    {/* Хедер: Назва + Статус */}
                    <div className="mb-8 pb-6 border-b border-border/50">
                        
                        {/* Верхній рядок: Назва + Edit */}
                        <div className="flex justify-between items-start gap-4 mb-6">
                            <div className="flex-1 min-w-0"> {/* Обгортка для переносу слів */}
                                <h1 className="text-2xl md:text-3xl font-bold text-bone font-gothic tracking-wide break-words leading-tight">
                                    {artwork.title}
                                </h1>
                            </div>
                            <Link 
                                to={`/projects/${id}/edit`} 
                                className="shrink-0 p-2 text-muted hover:text-blood hover:bg-void rounded-sm transition-colors border border-transparent hover:border-border"
                                title="Edit Project"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Нижній рядок: Статус + Час */}
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                            {/* Кастомний селект (без синього) */}
                            <StatusDropdown 
                                value={artwork.status} 
                                onChange={onStatusSelectChange} 
                                options={ART_STATUSES} 
                            />

                            <div className="text-right">
                                <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Total Time</div>
                                <div className="text-lg font-gothic text-blood tracking-widest">
                                    {getTotalTime(fullHistory)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Кнопка СЕСІЇ */}
                    {isActiveStatus ? (
                        <Link 
                            to={`/projects/${id}/session`} 
                            className="
                                group relative w-full mb-8 overflow-hidden rounded-sm
                                bg-blood border border-blood
                                text-white 
                                transition-all duration-300
                                hover:bg-transparent hover:text-blood
                                shadow-[0_0_15px_rgba(159,18,57,0.3)]
                            "
                        >
                            <div className="relative px-6 py-4 flex items-center justify-between">
                                <div className="flex flex-col items-start">
                                    {/* 👇 Змінив текст на більш канонічний */}
                                    <span className="text-lg font-bold font-mono tracking-[0.1em] uppercase">Enter Session</span>
                                </div>
                                <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </div>
                        </Link>
                    ) : (
                        <div className="mb-8 p-4 bg-void border border-border rounded-sm text-center">
                            <p className="text-xs text-muted mb-2 uppercase tracking-widest">
                                Project is {artwork.status === 'FINISHED' ? 'Complete' : 'Inactive'}
                            </p>
                            <button 
                                onClick={() => onStatusSelectChange('IN_PROGRESS')}
                                className="text-blood hover:text-white text-xs font-bold uppercase tracking-widest transition-colors hover:underline decoration-blood underline-offset-4"
                            >
                                Resume (In Progress)
                            </button>
                        </div>
                    )}
                    
                    {/* Таби */}
                    <div className="mb-6">
                        <Tabs items={PROJECT_TABS} activeId={activeTab} onChange={setActiveTab} />
                    </div>

                    {/* Контент табів */}
                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300 min-h-[200px]">
                        
                        {activeTab === 'INFO' && (
                            <ArtworkInfoPanel artwork={artwork} showEditButton={false} />
                        )}

                        {activeTab === 'HISTORY' && (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                                    <SessionHistoryList history={visibleHistory} onImageClick={handleHistoryImageClick} />
                                    <LoadMoreTrigger hasMore={hasMoreHistory} onLoadMore={handleLoadMoreHistory} totalLoaded={visibleHistory.length} totalItems={fullHistory.length} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'COLLECTIONS' && (
                            <div className="space-y-4">
                                {artwork.status === 'FINISHED' ? (
                                    <button 
                                        onClick={() => setCollectionModalOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-void hover:bg-ash text-bone border border-border hover:border-blood py-3 rounded-sm transition group shadow-md mb-4"
                                    >
                                        <BookmarkIcon className="w-4 h-4 group-hover:text-blood transition-colors" />
                                        <span className="font-bold text-xs uppercase tracking-widest group-hover:text-white">Manage Grimoires</span>
                                    </button>
                                ) : (
                                    <div className="p-4 bg-void border border-border rounded-sm mb-4 flex gap-3 items-center">
                                        <InformationCircleIcon className="w-5 h-5 text-muted shrink-0" />
                                        <span className="text-xs text-muted">Grimoire management is only available for finished rituals.</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {inCollections.length > 0 ? (
                                        inCollections.map(col => (
                                            <Link key={col.id} to={`/collections/${col.id}`} className="flex items-center gap-3 bg-ash border border-border p-2 rounded-sm hover:border-blood/50 transition group">
                                                <div className="w-10 h-10 bg-void rounded-sm flex items-center justify-center text-muted border border-border group-hover:border-blood overflow-hidden shrink-0">
                                                    {col.cover_image || col.latest_image ? (
                                                        <img src={artworkService.getImageUrl(col.cover_image || col.latest_image)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Squares2X2Icon className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-bone group-hover:text-blood transition text-xs uppercase tracking-wider truncate">{col.title}</h4>
                                                    <span className="text-[9px] text-muted uppercase tracking-widest">{col.type}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted/40 py-6 border border-dashed border-border rounded-sm text-xs italic tracking-wider">
                                            Not recorded in any Grimoire
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isStatusConfirmOpen}
                onClose={() => setStatusConfirmOpen(false)}
                onConfirm={handleConfirmStatusChange}
                title="Alter Reality?"
                message={`Resuming this ritual will remove it from ${inCollections.length} Grimoires automatically. Proceed?`}
                confirmText="Resume"
            />

            {artwork && (
                <AddToCollectionModal 
                    isOpen={isCollectionModalOpen}
                    onClose={() => { setCollectionModalOpen(false); fetchAllData(true); }} 
                    artworkId={artwork.id}
                    artworkImage={artworkService.getImageUrl(artwork.image_path)}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;