import { useState, useEffect, useMemo } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import collectionService from '../services/collectionService';
import CollectionCard from '../components/CollectionCard'; // 👈 Новий компонент
import CollectionToolbar from '../components/CollectionToolbar';
import Pagination from '../components/ui/Pagination';

const SavedCollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Фільтрація (Search, Tabs, Sort)
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: 'saved_at', dir: 'DESC' }); // Сортуємо за часом збереження

    // Пагінація
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const data = await collectionService.getSavedCollections();
                setCollections(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, []);

    // Скидання сторінки при пошуку
    useEffect(() => setCurrentPage(1), [search, filterType]);

    // Обробка даних (Мемоізація)
    const processedCollections = useMemo(() => {
        let result = [...collections];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(q) || (c.author_name && c.author_name.toLowerCase().includes(q)));
        }

        if (filterType !== 'ALL') {
            result = result.filter(c => c.type === filterType);
        }

        result.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            // Якщо сортуємо за датою збереження (за замовчуванням)
            if (sortConfig.key === 'saved_at') {
                 valA = new Date(valA).getTime();
                 valB = new Date(valB).getTime();
            }

            if (valA < valB) return sortConfig.dir === 'ASC' ? -1 : 1;
            if (valA > valB) return sortConfig.dir === 'ASC' ? 1 : -1;
            return 0;
        });

        return result;
    }, [collections, search, filterType, sortConfig]);

    // Пагінація
    const currentItems = processedCollections.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Заголовок */}
            <div className="mb-8">
                <div className="flex items-center gap-3 text-cherry-500 mb-1">
                    <BookmarkIcon className="w-8 h-8" />
                    <h1 className="text-3xl font-bold font-pixel tracking-wide">Збережене</h1>
                </div>
                <p className="text-slate-500 text-sm">Колекції, які вас надихнули</p>
            </div>

            {/* Тулбар */}
            <CollectionToolbar 
                search={search} setSearch={setSearch}
                filter={filterType} setFilter={setFilterType}
                sortConfig={sortConfig} setSortConfig={setSortConfig}
            />

            {/* Контент */}
            {loading ? (
                <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
            ) : (
                <>
                    {processedCollections.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <p className="text-slate-400 font-bold mb-2">Тут поки пусто</p>
                            <p className="text-slate-600 text-sm">Зберігайте цікаві колекції, щоб не загубити їх</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                                {currentItems.map(col => (
                                    <CollectionCard key={col.id} collection={col} />
                                ))}
                            </div>
                            
                            <Pagination 
                                totalItems={processedCollections.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default SavedCollectionsPage;