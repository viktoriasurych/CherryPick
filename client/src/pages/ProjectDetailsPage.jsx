import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    BookmarkIcon, 
    ClockIcon, 
    InformationCircleIcon, 
    Squares2X2Icon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Сервіси
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';
import collectionService from '../services/collectionService';

// Компоненти
import AddToCollectionModal from '../components/AddToCollectionModal';
import Tabs from '../components/ui/Tabs';
import AtmosphereImage from '../components/ui/AtmosphereImage'; // 👈 Красиве фото
import ArtworkInfoPanel from '../components/ArtworkInfoPanel';   // 👈 Вся інфа про картину (DRY)
import BackButton from '../components/ui/BackButton';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    
    // --- STATE ---
    const [artwork, setArtwork] = useState(null);
    const [history, setHistory] = useState([]);
    const [inCollections, setInCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('INFO');

    const fileInputRef = useRef(null);

    const PROJECT_TABS = [
        { id: 'INFO', label: 'Про роботу' },
        { id: 'HISTORY', label: 'Історія сесій' },
        { id: 'COLLECTIONS', label: 'У колекціях' }
    ];

    // --- DATA LOADING ---
    const fetchAllData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            
            const [artData, historyData, collectionsIds] = await Promise.all([
                artworkService.getById(id),
                sessionService.getHistory(id),
                collectionService.getCollectionsByArtwork(id)
            ]);

            setArtwork(artData);
            setHistory(historyData);

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
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [id]);

    // --- HANDLERS ---
    const handleQuickStatusChange = async (newStatus) => {
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
            alert("Помилка оновлення статусу");
        }
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await artworkService.addGalleryImage(id, file, 'Деталь');
            fetchAllData(true);
        } catch (error) {
            alert('Не вдалося завантажити фото');
        }
    };

    // --- HELPERS ---
    const formatDuration = (s) => {
         const h = Math.floor(s / 3600);
         const m = Math.floor((s % 3600) / 60);
         if (h > 0) return `${h} год ${m} хв`;
         return `${m} хв`;
    };
    
    const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA', { 
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' 
    });

    const STATUSES = { 
        'PLANNED': '📅 Заплановано', 
        'SKETCH': '✏️ Скетч', 
        'IN_PROGRESS': '🚧 В процесі', 
        'FINISHED': '✅ Завершено', 
        'ON_HOLD': '⏸ На паузі', 
        'DROPPED': '❌ Покинуто' 
    };

    if (loading) return <div className="text-center text-bone-200 mt-20">Завантаження...</div>;
    if (!artwork) return null;

    // --- ЗБИРАЄМО ФОТО ---
    const allImages = [];
    const addedPaths = new Set();

    if (artwork.image_path) {
        allImages.push({ id: 'cover_main', src: artwork.image_path, type: 'Обкладинка', isCover: true });
        addedPaths.add(artwork.image_path);
    }

    if (artwork.gallery) {
        artwork.gallery.forEach(img => {
            if (!addedPaths.has(img.image_path)) {
                allImages.push({ id: `gal_${img.id}`, src: img.image_path, type: img.description || 'Деталь' });
                addedPaths.add(img.image_path);
            }
        });
    }

    const currentSrc = selectedImage || artwork.image_path;

    return (
        <div className="p-4 md:p-8 relative min-h-screen max-w-7xl mx-auto">
            
            {/* <Link to="/projects" className="text-slate-500 hover:text-cherry-500 mb-6 inline-flex items-center gap-2 transition">
                <ArrowLeftIcon className="w-4 h-4" /> Назад до архіву
            </Link> */}
            <div className="mb-6">
            <BackButton label="Назад" fallbackPath="/projects" />
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* === ЛІВА КОЛОНКА (7/12): ВІЗУАЛ === */}
                <div className="lg:col-span-7 space-y-4">
                    
                    {/* ГОЛОВНЕ ФОТО (Atmosphere) */}
                    <div className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 group bg-black">
                        <AtmosphereImage 
                            src={artworkService.getImageUrl(currentSrc)} 
                            alt="Selected Artwork" 
                            className="w-full h-full"
                        />
                        
                        <div className="absolute top-4 right-4 z-20">
                            <select 
                                value={artwork.status}
                                onChange={(e) => handleQuickStatusChange(e.target.value)}
                                className="appearance-none bg-black/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg cursor-pointer hover:border-cherry-500 text-center focus:outline-none transition"
                            >
                                {Object.entries(STATUSES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* СТРІЧКА МІНІАТЮР */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 p-1">
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="min-w-[80px] h-[100px] bg-slate-900 border border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-cherry-500 hover:border-cherry-500 transition shrink-0 cursor-pointer group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition">+</span>
                            <span className="text-[10px] mt-1">Додати</span>
                            <input type="file" ref={fileInputRef} onChange={handleGalleryUpload} className="hidden" />
                        </div>

                        {allImages.map((img) => {
                            const isSelected = currentSrc === img.src;
                            return (
                                <div 
                                    key={img.id} 
                                    onClick={() => setSelectedImage(img.src)} 
                                    className="min-w-[80px] w-[80px] flex flex-col gap-1 cursor-pointer group shrink-0"
                                >
                                    <div className={`
                                        h-[80px] w-full rounded-lg overflow-hidden border-2 transition relative
                                        ${isSelected ? 'border-cherry-500 shadow-lg shadow-cherry-900/50' : 'border-transparent opacity-70 hover:opacity-100'}
                                    `}>
                                        <img src={artworkService.getImageUrl(img.src)} alt={img.type} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[9px] text-center uppercase tracking-wider truncate px-1 ${isSelected ? 'text-cherry-400 font-bold' : 'text-slate-600'}`}>
                                        {img.type}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === ПРАВА КОЛОНКА (5/12): ІНФОРМАЦІЯ === */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-cherry-500 mb-2 font-pixel tracking-wide break-words">
                        {artwork.title}
                    </h1>
                    
                    <div className="mb-6 mt-4">
                        <Tabs 
                            items={PROJECT_TABS} 
                            activeId={activeTab} 
                            onChange={setActiveTab} 
                            className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                        />
                    </div>

                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        
                        {/* --- TAB 1: INFO --- */}
                        {activeTab === 'INFO' && (
                            <div className="space-y-6 h-full flex flex-col">
                                {/* 👇 ВИКОРИСТОВУЄМО СПІЛЬНИЙ КОМПОНЕНТ */}
                                <ArtworkInfoPanel artwork={artwork} showEditButton={true} />

                                {/* Додаткова кнопка "Малювати", яка потрібна тільки тут */}
                                <div className="mt-4">
                                    <Link to={`/projects/${id}/session`} className="block w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 text-center transition flex items-center justify-center gap-2 text-sm">
                                        <ClockIcon className="w-5 h-5" /> Малювати
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: HISTORY --- */}
                        {activeTab === 'HISTORY' && (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-slate-500 text-xs uppercase font-bold">Сесій: {history.length}</span>
                                </div>
                                {history.map((session) => (
                                    <div key={session.session_id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition flex gap-4">
                                        <div className="text-center min-w-[60px]">
                                            <div className="text-cherry-400 font-bold font-mono text-lg">{formatDuration(session.duration_seconds)}</div>
                                        </div>
                                        <div className="border-l border-slate-800 pl-4 grow">
                                            <div className="text-slate-500 text-xs mb-1">{formatDate(session.end_time)}</div>
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{session.note_content || <span className="italic opacity-50">Без нотаток</span>}</p>
                                        </div>
                                        {session.note_photo && (
                                            <div 
                                                className="w-16 h-16 bg-black rounded overflow-hidden shrink-0 cursor-pointer border border-slate-700 group/zoom"
                                                onClick={() => {
                                                    setSelectedImage(session.note_photo);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                <img src={artworkService.getImageUrl(session.note_photo)} className="w-full h-full object-cover group-hover/zoom:scale-110 transition duration-500" alt="Progress" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="text-center py-10 text-slate-500 italic border border-dashed border-slate-800 rounded">
                                        Історія поки порожня. Почніть першу сесію!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB 3: COLLECTIONS --- */}
                        {activeTab === 'COLLECTIONS' && (
                            <div className="space-y-4">
                                {artwork.status === 'FINISHED' ? (
                                    <button 
                                        onClick={() => setCollectionModalOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-cherry-400 border border-slate-800 hover:border-cherry-900/50 py-3 rounded-lg transition group shadow-lg mb-6"
                                    >
                                        <BookmarkIcon className="w-5 h-5 group-hover:scale-110 transition" />
                                        <span className="font-bold text-sm">Керувати колекціями</span>
                                    </button>
                                ) : (
                                    <div className="bg-slate-900/50 p-4 rounded border border-slate-800 mb-6 text-sm text-slate-400 flex gap-2 items-center">
                                        <InformationCircleIcon className="w-5 h-5 text-slate-500" />
                                        <span>Додавання в колекції доступне після завершення роботи.</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {inCollections.length > 0 ? (
                                        inCollections.map(col => (
                                            <Link 
                                                key={col.id} 
                                                to={`/collections/${col.id}`} 
                                                className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-lg hover:border-cherry-900 transition group"
                                            >
                                                <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-slate-600 border border-slate-800 group-hover:border-cherry-900/50 overflow-hidden">
                                                    {col.cover_image || col.latest_image ? (
                                                        <img src={artworkService.getImageUrl(col.cover_image || col.latest_image)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Squares2X2Icon className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-200 group-hover:text-cherry-400 transition text-sm">{col.title}</h4>
                                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{col.type}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center text-slate-500 py-8 border border-dashed border-slate-800 rounded">
                                            Ця робота поки не додана в жодну колекцію
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модалка */}
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