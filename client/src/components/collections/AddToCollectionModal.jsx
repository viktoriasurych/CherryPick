import { useState, useEffect, useCallback } from 'react';
import { 
    XMarkIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    CheckCircleIcon,
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import collectionService from '../../services/collectionService';
import { useCreateCollection } from '../../hooks/useCreateCollection';
import Loader from '../ui/Loader';

const AddToCollectionModal = ({ isOpen, onClose, artworkId, artworkImage }) => {
    const [collections, setCollections] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [allCols, existingIds] = await Promise.all([
                collectionService.getAll(),
                collectionService.getCollectionsByArtwork(artworkId)
            ]);
            setCollections(allCols);
            setSelectedIds(new Set(existingIds)); 
        } catch (error) {
            console.error("Error loading grimoires:", error);
        } finally {
            setLoading(false);
        }
    }, [artworkId]);

    const { openModal: openCreateModal, CreateModal } = useCreateCollection(loadData);

    useEffect(() => {
        if (isOpen && artworkId) {
            loadData();
        }
    }, [isOpen, artworkId, loadData]);

    const toggleCollection = async (collectionId) => {
        const isSelected = selectedIds.has(collectionId);
        const nextSet = new Set(selectedIds);
        
        if (isSelected) nextSet.delete(collectionId);
        else nextSet.add(collectionId);
        setSelectedIds(nextSet);

        try {
            if (isSelected) await collectionService.removeItem(collectionId, artworkId);
            else await collectionService.addItem(collectionId, artworkId);
        } catch (error) {
            setSelectedIds(selectedIds);
            console.error("Failed to update collection"); 
        }
    };

    if (!isOpen) return null;

    const filteredCollections = collections.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const getIcon = (type) => {
        switch (type) {
            case 'MOODBOARD': return <Squares2X2Icon className="w-4 h-4" />;
            case 'SERIES': return <QueueListIcon className="w-4 h-4" />;
            case 'EXHIBITION': return <SparklesIcon className="w-4 h-4" />;
            default: return <Squares2X2Icon className="w-4 h-4" />;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
                <div className="bg-deep border border-border rounded-sm w-full max-w-md shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[80vh] font-mono" onClick={e => e.stopPropagation()}>
                    
                    <div className="p-4 border-b border-border flex justify-between items-center bg-deep">
                        <h3 className="text-bone font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                            <BookmarkIcon className="w-5 h-5 text-blood" /> 
                            Add to Grimoire
                        </h3>
                        <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                            <XMarkIcon className="w-5 h-5 text-muted hover:text-blood" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-charcoal scrollbar-track-transparent">
                        
                        <div className="flex items-center gap-3 p-2 mb-2 bg-charcoal/50 rounded-sm mx-2 border border-border/50">
                            <img src={artworkImage} alt="" className="w-10 h-10 rounded-sm object-cover opacity-80" />
                            <span className="text-[10px] uppercase tracking-widest text-muted">Select grimoires to haunt...</span>
                        </div>

                        <div className="px-2 mb-2">
                            <div className="flex items-center bg-charcoal border border-border rounded-sm px-3 py-2 focus-within:border-blood/50 transition duration-300">
                                <MagnifyingGlassIcon className="w-4 h-4 text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-bone placeholder-muted/50 font-mono"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1 p-2 min-h-50">
                            {loading ? (
                                <div className="flex items-center justify-center py-4 scale-75 origin-top">
                                    <Loader text="Summoning..." />
                                </div>
                            ) : filteredCollections.length > 0 ? (
                                filteredCollections.map(col => {
                                    const isSelected = selectedIds.has(col.id);
                                    return (
                                        <div 
                                            key={col.id} 
                                            onClick={() => toggleCollection(col.id)}
                                            className={`
                                                flex items-center justify-between p-2 rounded-sm cursor-pointer transition-all group border 
                                                ${isSelected 
                                                    ? 'bg-blood/10 border-blood/30' 
                                                    : 'border-transparent hover:bg-charcoal hover:border-border'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                                                <div className={`w-8 h-8 rounded-sm flex items-center justify-center bg-ash shrink-0 ${isSelected ? 'text-blood' : 'text-muted'}`}>
                                                    {getIcon(col.type)}
                                                </div>
                                                
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-xs font-bold uppercase tracking-wide truncate ${isSelected ? 'text-blood' : 'text-muted group-hover:text-bone'}`}>
                                                        {col.title}
                                                    </span>
                                                    <span className="text-[9px] text-muted/50 truncate">
                                                        {col.item_count} works
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`transition-all duration-300 shrink-0 ${isSelected ? 'text-blood scale-110' : 'text-muted/20'}`}>
                                                {isSelected ? <CheckCircleSolid className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-muted/30 text-[10px] uppercase tracking-widest italic">
                                    The void is empty...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3 border-t border-border bg-deep">
                        <button 
                            onClick={openCreateModal}
                            className="
                                flex items-center justify-center gap-2 w-full py-2.5 
                                rounded-sm border border-dashed border-muted/30 
                                text-muted hover:text-white hover:border-blood hover:bg-blood/5 
                                transition-all duration-300 text-[10px] uppercase tracking-widest font-bold
                            "
                        >
                            <PlusIcon className="w-3 h-3" /> Forge New Grimoire
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-60">
                <CreateModal />
            </div>
        </>
    );
};

export default AddToCollectionModal;