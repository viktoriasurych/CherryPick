import { useState, useEffect, useMemo } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import collectionService from '../../services/collectionService';
import CollectionCard from '../components/CollectionCard';
import CollectionToolbar from '../components/CollectionToolbar';
import Pagination from '../../components/ui/Pagination';
import useCollectionFilters from '../../hooks/useCollectionFilters';

const SavedCollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const { 
        search, setSearch, filterType, setFilterType, sortConfig, setSortConfig,
        currentPage, setCurrentPage, processedItems, currentItems, ITEMS_PER_PAGE
    } = useCollectionFilters(collections);

    useEffect(() => {
        setSortConfig({ key: 'saved_at', dir: 'DESC' });
    }, [setSortConfig]);

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

    // 👇 ФУНКЦІЯ ВИДАЛЕННЯ ЗІ ЗБЕРЕЖЕНИХ
    const handleUnsave = async (id) => {
        if (!window.confirm("Видалити зі збережених?")) return;
        try {
            await collectionService.unsaveCollection(id);
            // Видаляємо локально зі списку
            setCollections(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Помилка видалення:", error);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="mb-8">
                <div className="flex items-center gap-3 text-cherry-500 mb-1">
                    <BookmarkIcon className="w-8 h-8" />
                    <h1 className="text-3xl font-bold font-pixel tracking-wide">Збережене</h1>
                </div>
                <p className="text-slate-500 text-sm">Колекції, які вас надихнули</p>
            </div>

            <CollectionToolbar 
                search={search} setSearch={setSearch}
                filter={filterType} setFilter={setFilterType}
                sortConfig={sortConfig} setSortConfig={setSortConfig}
            />

            {loading ? (
                <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {currentItems.map(col => (
                            <CollectionCard 
                                key={col.id} 
                                collection={col} 
                                onUnsave={handleUnsave} // 👇 Передаємо функцію
                            />
                        ))}
                    </div>
                    
                    {processedItems.length === 0 && (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <p className="text-slate-400 font-bold mb-2">Тут поки пусто</p>
                            <p className="text-slate-600 text-sm">Зберігайте цікаві колекції, щоб не загубити їх</p>
                        </div>
                    )}

                    <Pagination 
                        totalItems={processedItems.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default SavedCollectionsPage;