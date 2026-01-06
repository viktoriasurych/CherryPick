import { useState, useEffect } from 'react';
import { XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';

import collectionService from '../../services/collectionService';
import CollectionCard from '../../components/collections/CollectionCard';
import CollectionToolbar from '../../components/collections/CollectionToolbar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal';
import useCollectionFilters from '../../hooks/useCollectionFilters';
import Loader from '../../components/ui/Loader'; 
import PageTitle from '../../components/shared/PageTitle'; 

const SavedCollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
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

    const requestUnsave = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

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
            <PageTitle title="Saved Collections" />

            <div className="max-w-480 mx-auto p-2 md:p-8">
                
                <CollectionToolbar 
                    title="Saved Collections"
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
                    <Loader text="Loading Saved Collections..." />
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
                                title="No Collections Saved"
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
                                            onUnsave={requestUnsave}
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