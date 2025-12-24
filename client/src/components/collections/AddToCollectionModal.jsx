import { useState, useEffect, useCallback } from 'react';
import { 
    XMarkIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    CheckCircleIcon,
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import collectionService from '../../services/collectionService';

// 👇 1. Імпортуємо наш хук
import { useCreateCollection } from '../../hooks/useCreateCollection';

const AddToCollectionModal = ({ isOpen, onClose, artworkId, artworkImage }) => {
    const [collections, setCollections] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // 👇 2. Функція завантаження даних (useCallback щоб не перестворювалась)
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
            console.error("Помилка завантаження колекцій:", error);
        } finally {
            setLoading(false);
        }
    }, [artworkId]);

    // 👇 3. Хук створення. Передаємо loadData, щоб після створення список оновився
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
            setSelectedIds(selectedIds); // Відкат
            alert("Помилка збереження");
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
            {/* ОСНОВНЕ ВІКНО "ДОДАТИ В КОЛЕКЦІЮ" */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
                <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="text-cherry-500 text-lg">🔖</span> 
                            Додати в колекцію
                        </h3>
                        <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 hover:text-white" /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                        
                        <div className="flex items-center gap-3 p-2 mb-2 bg-slate-900/50 rounded-lg mx-2 border border-slate-800/50">
                            <img src={artworkImage} alt="" className="w-10 h-10 rounded object-cover opacity-80" />
                            <span className="text-xs text-slate-400">Виберіть колекції для збереження</span>
                        </div>

                        <div className="px-2 mb-2">
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md px-3 py-2 focus-within:border-cherry-500/50 transition">
                                <MagnifyingGlassIcon className="w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Знайти..." 
                                    className="bg-transparent border-none outline-none text-sm ml-2 w-full text-white placeholder-slate-600"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1 p-2">
                            {loading ? (
                                <div className="text-center py-4 text-slate-600 text-xs">Завантаження...</div>
                            ) : filteredCollections.length > 0 ? (
                                filteredCollections.map(col => {
                                    const isSelected = selectedIds.has(col.id);
                                    return (
                                        <div 
                                            key={col.id} 
                                            onClick={() => toggleCollection(col.id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition group border border-transparent ${isSelected ? 'bg-cherry-900/10 border-cherry-900/30' : 'hover:bg-slate-900'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center bg-slate-800 text-slate-500 ${isSelected ? 'text-cherry-400' : ''}`}>
                                                    {getIcon(col.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-cherry-200' : 'text-slate-300 group-hover:text-white'}`}>{col.title}</span>
                                                    <span className="text-[10px] text-slate-600">{col.item_count} робіт</span>
                                                </div>
                                            </div>
                                            <div className={`transition-all duration-200 ${isSelected ? 'text-cherry-500 scale-110' : 'text-slate-700'}`}>
                                                {isSelected ? <CheckCircleSolid className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-xs">Нічого не знайдено</div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-900 bg-slate-950">
                        <button 
                            onClick={openCreateModal}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-900 transition text-sm"
                        >
                            <PlusIcon className="w-4 h-4" /> Створити нову колекцію
                        </button>
                    </div>
                </div>
            </div>

            {/* 👇 ВІКНО СТВОРЕННЯ (z-index: 60 щоб було поверх z-50) */}
            <div className="relative z-[60]">
                <CreateModal />
            </div>
        </>
    );
};

export default AddToCollectionModal;