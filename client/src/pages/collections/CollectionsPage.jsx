import { useState, useEffect } from 'react';
import { PlusIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

import collectionService from '../../services/collectionService';
import CollectionCard from '../../components/collections/CollectionCard';
import CollectionToolbar from '../../components/collections/CollectionToolbar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import useCollectionFilters from '../../hooks/useCollectionFilters';
import { useCreateCollection } from '../../hooks/useCreateCollection';
import Loader from '../../components/ui/Loader';
import PageTitle from '../../components/shared/PageTitle';

const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const { 
        search, setSearch, filterType, setFilterType, sortConfig, setSortConfig,
        currentPage, setCurrentPage, processedItems, currentItems, ITEMS_PER_PAGE
    } = useCollectionFilters(collections);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const data = await collectionService.getAll();
            setCollections(data);
        } catch (error) {
            console.error("Load error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    const { openModal, CreateModal } = useCreateCollection(fetchCollections);

    const sortOptions = [
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
            <PageTitle title="Collections" />

            <div className="max-w-480 mx-auto p-4 md:p-8">
                
                <CollectionToolbar 
                    title="My Collections"
                    subTitle={loading ? 'Scanning...' : `${collections.length} Archives Found`}
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
                    <Loader text="Summoning Collections..." />
                ) : (
                    <>
                        {/* сцена 1: нічого за пошуком */}
                        {processedItems.length === 0 && collections.length > 0 && (
                            <EmptyState 
                                title="Silence..."
                                message="No collections match your query."
                                actionLabel="Clear Search Filters"
                                onAction={handleResetSearch}
                                icon={XMarkIcon}
                            />
                        )}

                        {/* сцена 2: порожня бд */}
                        {collections.length === 0 && (
                            <EmptyState 
                                title="No Collections Yet"
                                message="Organize your art into series or moodboards."
                                actionLabel="Create First Collection"
                                onAction={openModal} 
                                icon={PlusIcon}
                            />
                        )}

                        {/* сцена 3: колекції */}
                        {(processedItems.length > 0 || (currentPage === 1 && !search && filterType === 'ALL' && collections.length > 0)) && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 items-stretch">
                                    
                                    {currentPage === 1 && !search && filterType === 'ALL' && (
                                        <div 
                                            onClick={openModal} 
                                            className="
                                                group relative w-full cursor-pointer 
                                                rounded-sm border border-dashed border-border bg-void/50 
                                                transition-all duration-500 hover:border-blood hover:bg-void 
                                                flex flex-row items-center justify-center gap-3 
                                                h-auto py-3 min-h-0 
                                                sm:flex-col sm:h-auto sm:aspect-3/4 sm:min-h-75 sm:gap-6 sm:py-0
                                            "
                                        >
                                            <PlusIcon className="w-5 h-5 sm:w-12 sm:h-12 text-muted/30 stroke-1 group-hover:text-blood group-hover:scale-110 transition-all duration-500" />
                                            <span className="text-[10px] font-gothic text-muted group-hover:text-bone uppercase tracking-[0.2em] transition-colors">
                                                Create New
                                            </span>
                                        </div>
                                    )}

                                    {currentItems.map(col => (
                                        <CollectionCard key={col.id} collection={col} />
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

                <CreateModal />
            </div>
        </div>
    );
};

export default CollectionsPage;