import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import collectionService from '../../services/collectionService';

// 👇 Компоненти колекцій лежать у components/collections
import CollectionToolbar from '../../components/collections/CollectionToolbar';
import CollectionCard from '../../components/collections/CollectionCard';

import Pagination from '../../components/ui/Pagination';
import useCollectionFilters from '../../hooks/useCollectionFilters';
import { useCreateCollection } from '../../hooks/useCreateCollection';

const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const { 
        search, setSearch, filterType, setFilterType, sortConfig, setSortConfig,
        currentPage, setCurrentPage, processedItems, currentItems, ITEMS_PER_PAGE
    } = useCollectionFilters(collections);

    const fetchCollections = async () => {
        try {
            const data = await collectionService.getAll();
            setCollections(data);
        } catch (error) {
            console.error("Помилка:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    // 👇 Використовуємо хук: передаємо функцію оновлення списку
    const { openModal, CreateModal } = useCreateCollection(fetchCollections);

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Мої Колекції</h1>
                    <p className="text-slate-500 text-sm mt-1">Керуйте своїми виставками, серіями та дошками натхнення</p>
                </div>
                
                {/* 👇 Кнопка тепер просто викликає openModal */}
                <button onClick={openModal} className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg group">
                    <PlusIcon className="w-5 h-5 group-hover:scale-110 transition" />
                    <span className="font-bold text-sm">Створити нову</span>
                </button>
            </div>

            {/* Toolbar */}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {/* Картка "Створити нову" */}
                        {currentPage === 1 && !search && filterType === 'ALL' && (
                            <div
                                onClick={openModal} // 👇 Тут теж openModal
                                className="group border border-dashed border-slate-700 bg-slate-900/20 hover:bg-slate-900 hover:border-cherry-500 rounded-xl flex flex-col items-center justify-center cursor-pointer min-h-[320px] transition-all relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-cherry-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-cherry-500/50 shadow-xl">
                                    <PlusIcon className="w-8 h-8 text-slate-400 group-hover:text-cherry-500 transition-colors" />
                                </div>
                                <span className="mt-4 text-sm font-bold text-slate-400 group-hover:text-cherry-400 uppercase tracking-wider transition-colors">Створити колекцію</span>
                            </div>
                        )}

                        {currentItems.map(col => (
                            <CollectionCard key={col.id} collection={col} />
                        ))}
                    </div>
                    
                    {processedItems.length === 0 && (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <p className="text-slate-400 font-bold">Нічого не знайдено</p>
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

            {/* 👇 Вставляємо модалку одним рядком */}
            <CreateModal />
        </div>
    );
};

export default CollectionsPage;