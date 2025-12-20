import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    PlusIcon, 
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon,
    GlobeAltIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import collectionService from '../services/collectionService';
import artworkService from '../services/artworkService';
import CollectionCreateModal from '../components/CollectionCreateModal';
import CollectionToolbar from '../components/CollectionToolbar';
import Pagination from '../components/ui/Pagination';

// 👇 ІМПОРТ ДЕФОЛТНОГО ФОТО (Переконайся, що файл існує в assets)
import defaultCollectionImg from '../assets/default-collection.png'; 

const CollectionsPage = () => {
    // Дані
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI стан
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // Фільтрація та Сортування
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'MOODBOARD', 'SERIES', 'EXHIBITION'
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'DESC' });

    // Пагінація
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // 1. Завантаження даних
    const fetchCollections = async () => {
        try {
            const data = await collectionService.getAll();
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    // 2. Скидання пагінації при зміні фільтрів (UX)
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType]);

    const handleCreate = async (newCollectionData) => {
        await collectionService.create(newCollectionData);
        fetchCollections(); 
    };

    // 3. Обробка даних (Фільтр + Сорт)
    const processedCollections = useMemo(() => {
        let result = [...collections];

        // Пошук
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(q));
        }

        // Таби (Тип)
        if (filterType !== 'ALL') {
            result = result.filter(c => c.type === filterType);
        }

        // Сортування
        result.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Для тексту ігноруємо регістр
            if (sortConfig.key === 'title') {
                valA = valA ? valA.toLowerCase() : '';
                valB = valB ? valB.toLowerCase() : '';
            }

            if (valA < valB) return sortConfig.dir === 'ASC' ? -1 : 1;
            if (valA > valB) return sortConfig.dir === 'ASC' ? 1 : -1;
            return 0;
        });

        return result;
    }, [collections, search, filterType, sortConfig]);

    // 4. Пагінація (Зрізаємо шматок)
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = processedCollections.slice(indexOfFirstItem, indexOfLastItem);

    // Helpers
    const getTypeIcon = (type) => {
        switch(type) {
            case 'MOODBOARD': return <Squares2X2Icon className="w-4 h-4" />;
            case 'SERIES': return <QueueListIcon className="w-4 h-4" />;
            case 'EXHIBITION': return <SparklesIcon className="w-4 h-4 text-purple-400" />;
            default: return null;
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'MOODBOARD': return 'Мудборд';
            case 'SERIES': return 'Серія';
            case 'EXHIBITION': return 'Виставка';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Колекції</h1>
                    <p className="text-slate-500 text-sm mt-1">Твої виставки, серії та дошки натхнення</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg group"
                >
                    <PlusIcon className="w-5 h-5 group-hover:scale-110 transition" />
                    <span className="font-bold text-sm">Створити нову</span>
                </button>
            </div>

            {/* Toolbar (Таби, Пошук, Сортування) */}
            <CollectionToolbar 
                search={search} setSearch={setSearch}
                filter={filterType} setFilter={setFilterType}
                sortConfig={sortConfig} setSortConfig={setSortConfig}
            />

            {/* Content */}
            {loading ? (
                <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
            ) : (
                <>
                    {processedCollections.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <div className="text-4xl mb-4 text-slate-600">🔍</div>
                            <p className="text-slate-400 mb-2 font-bold">Нічого не знайдено</p>
                            <p className="text-slate-600 text-sm">Спробуйте змінити параметри пошуку</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                                {currentItems.map(col => {
                                    
                                    // 👇 ЛОГІКА ОБКЛАДИНКИ:
                                    // 1. Є своя обкладинка -> Беремо її
                                    // 2. Є остання робота -> Беремо її
                                    // 3. Нічого немає -> Беремо defaultCollectionImg
                                    
                                    let coverSrc = defaultCollectionImg;

                                    if (col.cover_image) {
                                        coverSrc = artworkService.getImageUrl(col.cover_image);
                                    } else if (col.latest_image) {
                                        coverSrc = artworkService.getImageUrl(col.latest_image);
                                    }

                                    return (
                                        <Link 
                                            to={`/collections/${col.id}`} 
                                            key={col.id} 
                                            className="group block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cherry-900/50 hover:shadow-xl hover:shadow-cherry-900/10 transition duration-300 flex flex-col h-full"
                                        >
                                            {/* Обкладинка */}
                                            <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={coverSrc} 
                                                    alt={col.title} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-in-out" 
                                                />
                                                
                                                {/* Статус (Публічна/Приватна) */}
                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur p-1.5 rounded-full border border-white/10 text-white z-10">
                                                    {col.is_public ? (
                                                        <GlobeAltIcon className="w-3 h-3 text-green-400" title="Публічна" />
                                                    ) : (
                                                        <LockClosedIcon className="w-3 h-3 text-slate-400" title="Приватна" />
                                                    )}
                                                </div>

                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-white/10 font-mono z-10">
                                                    {col.item_count} items
                                                </div>
                                            </div>
                                            
                                            {/* Інфо */}
                                            <div className="p-4 flex flex-col grow">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <h3 className="font-bold text-slate-200 truncate group-hover:text-cherry-400 transition text-lg">
                                                        {col.title}
                                                    </h3>
                                                    <div className="shrink-0 bg-slate-900 p-1.5 rounded text-slate-500 border border-slate-800" title={getTypeLabel(col.type)}>
                                                        {getTypeIcon(col.type)}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                                    {col.description || <span className="italic opacity-30">Опис відсутній</span>}
                                                </p>

                                                <div className="mt-auto pt-3 border-t border-slate-900 flex justify-between items-center">
                                                    <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                                                        {getTypeLabel(col.type)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 group-hover:text-cherry-400 transition">
                                                        Переглянути &rarr;
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Пагінація знизу */}
                            <Pagination 
                                totalItems={processedCollections.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </>
                    )}
                </>
            )}

            <CollectionCreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onCreate={handleCreate}
            />
        </div>
    );
};

export default CollectionsPage;