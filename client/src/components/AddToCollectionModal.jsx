import { useState, useEffect } from 'react';
import { 
    XMarkIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    CheckCircleIcon,
    Squares2X2Icon, // Moodboard
    QueueListIcon,  // Series
    SparklesIcon,   // Exhibition
    ArrowLeftIcon   // Кнопка назад
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import collectionService from '../services/collectionService';

const AddToCollectionModal = ({ isOpen, onClose, artworkId, artworkImage }) => {
    const [collections, setCollections] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // 👇 Логіка створення
    const [isCreating, setIsCreating] = useState(false);
    const [newType, setNewType] = useState(null); // 'MOODBOARD', 'SERIES', 'EXHIBITION'
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        if (isOpen && artworkId) {
            loadData();
            // Скидаємо стани при відкритті
            setIsCreating(false);
            setNewType(null);
            setNewTitle('');
        }
    }, [isOpen, artworkId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allCols, existingIds] = await Promise.all([
                collectionService.getAll(),
                collectionService.getCollectionsByArtwork(artworkId)
            ]);
            setCollections(allCols);
            setSelectedIds(new Set(existingIds)); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
            alert("Помилка збереження");
        }
    };

    const handleCreateQuick = async () => {
        if (!newTitle.trim() || !newType) return;
        try {
            const newCol = await collectionService.create({ 
                title: newTitle, 
                type: newType, 
                description: '' 
            });
            
            setCollections([newCol, ...collections]);
            await toggleCollection(newCol.id);
            
            // Скидання
            setIsCreating(false);
            setNewType(null);
            setNewTitle('');
        } catch (error) {
            alert("Не вдалося створити");
        }
    };

    if (!isOpen) return null;

    const filteredCollections = collections.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="text-cherry-500 text-lg">🔖</span> 
                        {isCreating ? 'Створення нової' : 'Додати в колекцію'}
                    </h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 hover:text-white" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    
                    {!isCreating && (
                        <>
                            {/* Міні-прев'ю */}
                            <div className="flex items-center gap-3 p-2 mb-2 bg-slate-900/50 rounded-lg mx-2 border border-slate-800/50">
                                <img src={artworkImage} alt="" className="w-10 h-10 rounded object-cover opacity-80" />
                                <span className="text-xs text-slate-400">Виберіть колекції для збереження</span>
                            </div>

                            {/* Пошук */}
                            <div className="px-2 mb-2">
                                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md px-3 py-2">
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

                            {/* Список */}
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
                                                        {col.type === 'MOODBOARD' && <Squares2X2Icon className="w-4 h-4" />}
                                                        {col.type === 'SERIES' && <QueueListIcon className="w-4 h-4" />}
                                                        {col.type === 'EXHIBITION' && <SparklesIcon className="w-4 h-4" />}
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
                        </>
                    )}

                    {/* 👇 РЕЖИМ СТВОРЕННЯ */}
                    {isCreating && (
                        <div className="p-4 animate-in fade-in zoom-in-95 duration-200">
                            
                            {/* КРОК 1: ВИБІР ТИПУ */}
                            {!newType ? (
                                <div>
                                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold text-center">Виберіть тип</p>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <button onClick={() => setNewType('MOODBOARD')} className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-400 transition group">
                                            <Squares2X2Icon className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">Мудборд</span>
                                        </button>
                                        <button onClick={() => setNewType('SERIES')} className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-green-500 hover:text-green-400 transition group">
                                            <QueueListIcon className="w-6 h-6 text-slate-500 group-hover:text-green-400" />
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">Серія</span>
                                        </button>
                                        <button onClick={() => setNewType('EXHIBITION')} className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500 hover:text-purple-400 transition group">
                                            <SparklesIcon className="w-6 h-6 text-slate-500 group-hover:text-purple-400" />
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">Виставка</span>
                                        </button>
                                    </div>
                                    <button onClick={() => setIsCreating(false)} className="w-full py-2 text-slate-500 text-xs hover:text-white">Скасувати</button>
                                </div>
                            ) : (
                                /* КРОК 2: НАЗВА */
                                <div>
                                    <div className="flex items-center gap-2 mb-3 cursor-pointer text-slate-500 hover:text-white" onClick={() => setNewType(null)}>
                                        <ArrowLeftIcon className="w-3 h-3" />
                                        <span className="text-xs">Змінити тип</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-slate-900 p-2 rounded text-cherry-500 border border-slate-800">
                                            {newType === 'MOODBOARD' && <Squares2X2Icon className="w-5 h-5" />}
                                            {newType === 'SERIES' && <QueueListIcon className="w-5 h-5" />}
                                            {newType === 'EXHIBITION' && <SparklesIcon className="w-5 h-5" />}
                                        </div>
                                        <input 
                                            autoFocus
                                            type="text" 
                                            className="w-full bg-slate-900 border border-cherry-500/50 rounded-md p-2 text-white text-sm focus:outline-none"
                                            placeholder="Назва нової збірки..."
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreateQuick()}
                                        />
                                    </div>

                                    <button 
                                        onClick={handleCreateQuick} 
                                        disabled={!newTitle.trim()}
                                        className="w-full bg-cherry-600 text-white text-sm py-2 rounded font-bold hover:bg-cherry-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Створити та Додати
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer: Створити нову */}
                {!isCreating && (
                    <div className="p-3 border-t border-slate-900 bg-slate-950">
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-900 transition text-sm"
                        >
                            <PlusIcon className="w-4 h-4" /> Створити нову колекцію
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddToCollectionModal;