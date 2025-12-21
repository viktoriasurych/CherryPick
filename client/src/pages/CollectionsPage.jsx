import { useState, useEffect, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

// Сервіси та компоненти
import collectionService from '../services/collectionService';
import CollectionCreateModal from '../components/CollectionCreateModal';
import CollectionToolbar from '../components/CollectionToolbar';
import Pagination from '../components/ui/Pagination';
import CollectionCard from '../components/CollectionCard'; // 👈 Наш новий універсальний компонент

const CollectionsPage = () => {
    // === СТАН ===
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // Фільтрація та Сортування
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'MOODBOARD', 'SERIES', 'EXHIBITION'
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'DESC' });

    // Пагінація
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // === ЗАВАНТАЖЕННЯ ДАНИХ ===
    const fetchCollections = async () => {
        try {
            const data = await collectionService.getAll();
            setCollections(data);
        } catch (error) {
            console.error("Помилка завантаження колекцій:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    // Скидаємо сторінку на 1-шу, якщо змінився пошук або фільтр
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType]);

    // === ОБРОБНИКИ ===
    const handleCreate = async (newCollectionData) => {
        await collectionService.create(newCollectionData);
        fetchCollections(); // Оновлюємо список після створення
    };

    // === ОБРОБКА ДАНИХ (МЕМОІЗАЦІЯ) ===
    const processedCollections = useMemo(() => {
        let result = [...collections];

        // 1. Пошук
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(q));
        }

        // 2. Фільтр за типом
        if (filterType !== 'ALL') {
            result = result.filter(c => c.type === filterType);
        }

        // 3. Сортування
        result.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Для текстових полів — ігноруємо регістр
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

    // === ПАГІНАЦІЯ ===
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = processedCollections.slice(indexOfFirstItem, indexOfLastItem);

    // === RENDER ===
    return (
        <div className="min-h-screen pb-20">
            
            {/* Header: Заголовок + Кнопка "Створити" */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Мої Колекції</h1>
                    <p className="text-slate-500 text-sm mt-1">Керуйте своїми виставками, серіями та дошками натхнення</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg group"
                >
                    <PlusIcon className="w-5 h-5 group-hover:scale-110 transition" />
                    <span className="font-bold text-sm">Створити нову</span>
                </button>
            </div>

            {/* Toolbar: Пошук, Таби, Сортування */}
            <CollectionToolbar 
                search={search} setSearch={setSearch}
                filter={filterType} setFilter={setFilterType}
                sortConfig={sortConfig} setSortConfig={setSortConfig}
            />

            {/* Content Area */}
            {loading ? (
                <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
            ) : (
                <>
                    {processedCollections.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <div className="text-4xl mb-4 text-slate-600">📂</div>
                            <p className="text-slate-400 mb-2 font-bold">Нічого не знайдено</p>
                            <p className="text-slate-600 text-sm">
                                {search || filterType !== 'ALL' 
                                    ? 'Спробуйте змінити параметри пошуку' 
                                    : 'Створіть свою першу колекцію!'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* 👇 ГРІД КАРТОК: Використовуємо CollectionCard */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                                {currentItems.map(col => (
                                    <CollectionCard key={col.id} collection={col} />
                                ))}
                            </div>
                            
                            {/* Пагінація */}
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

            {/* Модалка створення */}
            <CollectionCreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onCreate={handleCreate}
            />
        </div>
    );
};

export default CollectionsPage;