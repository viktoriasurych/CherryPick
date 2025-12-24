import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    BookmarkIcon, ClockIcon, InformationCircleIcon, 
    Squares2X2Icon, ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Сервіси
import artworkService from '../../services/artworkService';
import sessionService from '../../services/sessionService';
import collectionService from '../../services/collectionService';

// Компоненти
import AddToCollectionModal from '../components/AddToCollectionModal';
import Tabs from '../../components/ui/Tabs';
import AtmosphereImage from '../../components/ui/AtmosphereImage';
import ArtworkInfoPanel from '../components/ArtworkInfoPanel';
import BackButton from '../../components/ui/BackButton';
import SessionHistoryList from '../components/SessionHistoryList';
import LoadMoreTrigger from '../../components/ui/LoadMoreTrigger';
// 👇 1. Імпорт модалки підтвердження
import ConfirmModal from '../components/ConfirmModal'; 

const ITEMS_PER_LOAD = 5; 

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

    // 👇 2. Стейт для модалки підтвердження зміни статусу
    const [isStatusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null); // Який статус ми хочемо поставити

    const fileInputRef = useRef(null);

    const PROJECT_TABS = [
        { id: 'INFO', label: 'Про роботу' },
        { id: 'HISTORY', label: 'Історія сесій' },
        { id: 'COLLECTIONS', label: 'У колекціях' }
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
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [id]);

    // 👇 3. ФУНКЦІЯ, ЯКА ВИКОНУЄ ЗМІНУ (Після підтвердження або відразу)
    const executeStatusChange = async (newStatus) => {
        try {
            // Оптимістичне оновлення
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

    // 👇 4. ОБРОБНИК КЛІКУ В SELECT
    const onStatusSelectChange = (newStatus) => {
        // Якщо поточний статус "FINISHED" або "DROPPED", а ми хочемо змінити на активний...
        // ...і робота є в колекціях (бо вона видалиться)
        if (
            (artwork.status === 'FINISHED' || artwork.status === 'DROPPED') && 
            newStatus !== 'FINISHED' && 
            newStatus !== 'DROPPED' &&
            inCollections.length > 0 // Перевірка, чи є що втрачати
        ) {
            setPendingStatus(newStatus); // Запам'ятовуємо, що хотіли поставити
            setStatusConfirmOpen(true);  // Відкриваємо модалку
        } else {
            // Якщо безпечно - міняємо відразу
            executeStatusChange(newStatus);
        }
    };

    // Хендлер кнопки у модалці
    const handleConfirmStatusChange = () => {
        executeStatusChange(pendingStatus);
        setStatusConfirmOpen(false);
        setPendingStatus(null);
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
        return h > 0 ? `${h}г ${m}хв` : `${m}хв`;
    };

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
    const visibleHistory = fullHistory.slice(0, visibleCount);
    const hasMoreHistory = visibleCount < fullHistory.length;

    return (
        <div className="p-4 md:p-8 relative min-h-screen max-w-7xl mx-auto">
            
            <div className="mb-6">
                <BackButton label="Назад" fallbackPath="/projects" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ЛІВА КОЛОНКА */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 group bg-black">
                        <AtmosphereImage 
                            src={artworkService.getImageUrl(currentSrc)} 
                            alt="Selected Artwork" 
                            className="w-full h-full"
                        />
                        <div className="absolute top-4 right-4 z-20">
                            {/* 👇 Оновлений селект */}
                            <select 
                                value={artwork.status}
                                onChange={(e) => onStatusSelectChange(e.target.value)}
                                className="appearance-none bg-black/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg cursor-pointer hover:border-cherry-500 text-center focus:outline-none transition"
                            >
                                {Object.entries(STATUSES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Стрічка мініатюр... (код без змін) */}
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

                {/* ПРАВА КОЛОНКА */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <h1 className="text-3xl md:text-4xl font-bold text-cherry-500 mb-2 font-pixel tracking-wide break-words">
                        {artwork.title}
                    </h1>
                    
                    <div className="mb-6 mt-4">
                        <Tabs items={PROJECT_TABS} activeId={activeTab} onChange={setActiveTab} />
                    </div>

                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        {activeTab === 'INFO' && (
                            <div className="space-y-6 h-full flex flex-col">
                                <ArtworkInfoPanel artwork={artwork} showEditButton={true} />
                                <div className="mt-4">
                                    {['PLANNED', 'SKETCH', 'IN_PROGRESS'].includes(artwork.status) ? (
                                        <Link to={`/projects/${id}/session`} className="block w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 text-center transition flex items-center justify-center gap-2 text-sm">
                                            <ClockIcon className="w-5 h-5" /> Малювати
                                        </Link>
                                    ) : (
                                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center">
                                            <p className="text-slate-500 text-sm mb-2">
                                                Робота {artwork.status === 'FINISHED' ? 'завершена' : 'не активна'}. 
                                            </p>
                                            {/* 👇 Ця кнопка теж викликає перевірку */}
                                            <button 
                                                onClick={() => onStatusSelectChange('IN_PROGRESS')}
                                                className="text-cherry-500 hover:text-cherry-400 text-xs font-bold uppercase tracking-widest transition"
                                            >
                                                Відновити роботу (In Progress)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'HISTORY' && (
                            <div className="space-y-0 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                                        Всього сесій: <span className="text-white">{fullHistory.length}</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-cherry-500 bg-cherry-900/10 px-2 py-0.5 rounded border border-cherry-900/30">
                                        Σ {getTotalTime(fullHistory)}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 custom-scrollbar max-h-[500px]">
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
                                            <Link key={col.id} to={`/collections/${col.id}`} className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-lg hover:border-cherry-900 transition group">
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

            {/* 👇 МОДАЛКА ПІДТВЕРДЖЕННЯ ЗМІНИ СТАТУСУ */}
            <ConfirmModal 
                isOpen={isStatusConfirmOpen}
                onClose={() => setStatusConfirmOpen(false)}
                onConfirm={handleConfirmStatusChange}
                title="Зміна статусу"
                message={`Якщо ви відновите роботу, вона автоматично зникне з ${inCollections.length} колекцій, в які була додана. Продовжити?`}
                confirmText="Так, відновити"
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