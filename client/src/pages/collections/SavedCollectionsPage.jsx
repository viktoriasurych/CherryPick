import { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';

import collectionService from '../../services/collectionService';
import CollectionCard from '../../components/collections/CollectionCard';
import CollectionToolbar from '../../components/collections/CollectionToolbar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal'; // 👇 Імпортуємо
import useCollectionFilters from '../../hooks/useCollectionFilters';

const SavedCollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 👇 Стан для модалки
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

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
                setLoading(true);
                const data = await collectionService.getSavedCollections();
                setCollections(data);
            } catch (error) {
                console.error("Error loading saved collections:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, []);

    // 1. Відкрити модалку
    const requestUnsave = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    // 2. Підтвердити дію
    const handleUnsaveConfirm = async () => {
        const id = confirmModal.id;
        if (!id) return;

        try {
            await collectionService.unsaveCollection(id);
            setCollections(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Unsave error:", error);
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    const sortOptions = [
        { value: 'saved_at', label: 'Date Saved' },
        { value: 'created_at', label: 'Date Created' },
        { value: 'title', label: 'Title' },
        { value: 'item_count', label: 'Item Count' }
    ];

    const handleSortChange = (val) => setSortConfig(p => ({ ...p, key: val }));
    const toggleSortDir = () => setSortConfig(p => ({ ...p, dir: p.dir === 'ASC' ? 'DESC' : 'ASC' }));
    
    const handleResetSearch = () => {
        setSearch('');
        setFilterType('ALL');
    };

    return (
        <div className="relative min-h-screen pb-20 font-mono text-bone">
            <div className="max-w-[1920px] mx-auto p-4 md:p-8">
                
                <CollectionToolbar 
                    title="Saved Archives"
                    subTitle={loading ? 'Retrieving...' : `${collections.length} Collections Saved`}
                    search={search}
                    setSearch={setSearch}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    sortConfig={sortConfig}
                    onSortChange={handleSortChange}
                    onToggleDir={toggleSortDir}
                    sortOptions={sortOptions}
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted gap-4">
                        <ArrowPathIcon className="w-8 h-8 animate-spin text-blood" />
                        <span className="animate-pulse text-xs uppercase tracking-[0.3em]">Loading Saved Archives...</span>
                    </div>
                ) : (
                    <>
                        {processedItems.length === 0 && collections.length > 0 && (
                            <EmptyState 
                                title="Silence..."
                                message="No saved collections match your query."
                                actionLabel="Clear Search Filters"
                                onAction={handleResetSearch}
                                icon={XMarkIcon}
                            />
                        )}

                        {collections.length === 0 && (
                            <EmptyState 
                                title="No Archives Saved"
                                message="Save interesting collections to find them here later."
                                icon={BookmarkIcon}
                                actionLabel="Explore Archives"
                                actionLink="/collections"
                            />
                        )}

                        {processedItems.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 items-stretch">
                                    {currentItems.map(col => (
                                        <CollectionCard 
                                            key={col.id} 
                                            collection={col} 
                                            onUnsave={requestUnsave} // 👇 Передаємо функцію відкриття модалки
                                        />
                                    ))}
                                </div>

                                {processedItems.length > ITEMS_PER_PAGE && (
                                    <Pagination 
                                        totalItems={processedItems.length}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        currentPage={currentPage}
                                        onPageChange={(page) => {
                                            setCurrentPage(page);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* 👇 МОДАЛКА ПІДТВЕРДЖЕННЯ */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleUnsaveConfirm}
                title="Forget Archive?"
                message="This collection will be removed from your saved list. You can find it again in the public archives."
                confirmText="Remove"
            />
        </div>
    );
};

export default SavedCollectionsPage;