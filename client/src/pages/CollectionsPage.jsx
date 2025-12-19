import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    PlusIcon, 
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon 
} from '@heroicons/react/24/outline';
import collectionService from '../services/collectionService';
import artworkService from '../services/artworkService';
import CollectionCreateModal from '../components/CollectionCreateModal';

const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        try {
            const data = await collectionService.getAll();
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    const handleCreate = async (newCollectionData) => {
        await collectionService.create(newCollectionData);
        fetchCollections(); 
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'MOODBOARD': return <Squares2X2Icon className="w-4 h-4" />;
            case 'SERIES': return <QueueListIcon className="w-4 h-4" />;
            case 'EXHIBITION': return <SparklesIcon className="w-4 h-4 text-purple-400" />;
            default: return null;
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'MOODBOARD': return 'Мудборд';
            case 'SERIES': return 'Серія';
            case 'EXHIBITION': return 'Виставка';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Колекції</h1>
                    <p className="text-slate-500 text-sm mt-1">Твої виставки, серії та дошки натхнення</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg group"
                >
                    <PlusIcon className="w-5 h-5 group-hover:scale-110 transition" />
                    <span className="font-bold text-sm">Створити нову</span>
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження бібліотеки...</div>
            ) : (
                <>
                    {collections.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <div className="text-4xl mb-4">📂</div>
                            <p className="text-slate-400 mb-2 font-bold">Тут поки що пусто</p>
                            <p className="text-slate-600 text-sm mb-6">Створіть свою першу серію робіт або мудборд</p>
                            <button onClick={() => setCreateModalOpen(true)} className="text-cherry-500 hover:text-cherry-400 underline decoration-dashed">
                                Створити колекцію
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {collections.map(col => {
                                // 👇 ВИЗНАЧАЄМО ПРАВИЛЬНУ ОБКЛАДИНКУ ТУТ
                                const coverSrc = col.cover_image || col.latest_image;

                                return (
                                    <Link 
                                        to={`/collections/${col.id}`} 
                                        key={col.id} 
                                        className="group block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cherry-900/50 hover:shadow-xl hover:shadow-cherry-900/10 transition duration-300 flex flex-col h-full"
                                    >
                                        {/* Обкладинка */}
                                        <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
                                            {coverSrc ? (
                                                <img 
                                                    src={artworkService.getImageUrl(coverSrc)} 
                                                    alt={col.title} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-in-out" 
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-700">
                                                    <Squares2X2Icon className="w-8 h-8 opacity-20" />
                                                    <span className="text-[10px] uppercase tracking-widest font-bold">Пусто</span>
                                                </div>
                                            )}
                                            
                                            {/* Бейдж кількості */}
                                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-white/10 font-mono">
                                                {col.item_count} items
                                            </div>
                                        </div>
                                        
                                        {/* Інфо */}
                                        <div className="p-4 flex flex-col grow">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h3 className="font-bold text-slate-200 truncate group-hover:text-cherry-400 transition text-lg">
                                                    {col.title}
                                                </h3>
                                                <div className="shrink-0 bg-slate-900 p-1.5 rounded text-slate-500 border border-slate-800" title={getTypeLabel(col.type)}>
                                                    {getTypeIcon(col.type)}
                                                </div>
                                            </div>
                                            
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                                {col.description || <span className="italic opacity-30">Опис відсутній</span>}
                                            </p>

                                            <div className="mt-auto pt-3 border-t border-slate-900 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                                                    {getTypeLabel(col.type)}
                                                </span>
                                                <span className="text-[10px] text-slate-600">
                                                    Переглянути &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <CollectionCreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onCreate={handleCreate}
            />
        </div>
    );
};

export default CollectionsPage;