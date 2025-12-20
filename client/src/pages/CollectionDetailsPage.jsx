import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PencilSquareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import collectionService from '../services/collectionService';
import artworkService from '../services/artworkService';

const CollectionDetailsPage = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await collectionService.getById(id);
                setCollection(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-slate-500">Завантаження виставки...</div>;
    if (!collection) return <div className="text-center py-20 text-red-500">Колекцію не знайдено</div>;

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="mb-12 text-center border-b border-slate-900 pb-12 relative px-4">
                
                {/* Кнопка НАЗАД */}
                <div className="absolute top-0 left-4 md:left-8">
                    <Link to="/collections" className="text-slate-500 hover:text-cherry-500 text-sm inline-flex items-center gap-2 transition">
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Всі колекції</span>
                    </Link>
                </div>

                {/* Кнопка НАЛАШТУВАННЯ */}
                <div className="absolute top-0 right-4 md:right-8">
                    <Link 
                        to={`/collections/${id}/edit`}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        <span className="text-xs font-bold hidden sm:inline">Налаштування</span>
                    </Link>
                </div>

                {/* 👇 ВИПРАВЛЕНА НАЗВА: break-words break-all */}
                <div className="max-w-4xl mx-auto mt-12 md:mt-0 px-2">
                    <h1 className="text-4xl md:text-6xl font-bold text-cherry-500 font-pixel tracking-wider mb-4 uppercase break-words break-all leading-tight">
                        {collection.title}
                    </h1>
                    
                    {collection.description && (
                        <p className="text-slate-400 text-lg italic font-serif break-words">
                            "{collection.description}"
                        </p>
                    )}
                </div>
                
                <div className="mt-6 flex justify-center gap-2">
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-xs text-slate-500 uppercase tracking-widest">
                        {collection.type}
                    </span>
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-xs text-slate-500 uppercase tracking-widest">
                        {collection.items.length} робіт
                    </span>
                </div>
            </div>

            {/* ВІДОБРАЖЕННЯ ЗАЛЕЖНО ВІД ТИПУ */}
            
            {/* 1. MOODBOARD */}
            {collection.type === 'MOODBOARD' && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-4">
                    {collection.items.map(art => (
                        <Link to={`/projects/${art.id}`} key={art.id} className="break-inside-avoid group relative rounded-lg overflow-hidden block cursor-pointer">
                            <img 
                                src={artworkService.getImageUrl(art.image_path)} 
                                alt={art.title} 
                                className="w-full h-auto object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                                <span className="text-white text-xs font-bold truncate w-full">{art.title}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* 2. SERIES */}
            {collection.type === 'SERIES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {collection.items.map((art, idx) => (
                        <Link to={`/projects/${art.id}`} key={art.id} className="group block">
                            <div className="aspect-[4/5] bg-black rounded-sm overflow-hidden mb-4 border border-slate-900 group-hover:border-cherry-900 transition relative">
                                <span className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">No. {idx + 1}</span>
                                <img 
                                    src={artworkService.getImageUrl(art.image_path)} 
                                    alt={art.title} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700"
                                />
                            </div>
                            {/* Також додаємо break-all для назв картин */}
                            <h3 className="text-xl font-bold text-slate-200 group-hover:text-cherry-400 transition break-words break-all">{art.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {art.finished_year || 'Рік невідомий'}
                            </p>
                        </Link>
                    ))}
                </div>
            )}

           {/* 3. EXHIBITION */}
           {collection.type === 'EXHIBITION' && (
                <div className="max-w-6xl mx-auto space-y-32 px-4 py-10">
                    {collection.items.map((art) => {
                        let layoutClasses = "flex flex-col items-center gap-8"; 
                        let textAlign = "text-center max-w-lg";
                        
                        if (art.layout_type === 'LEFT_TEXT') {
                            layoutClasses = "flex flex-col md:flex-row items-center gap-12 md:gap-20";
                            textAlign = "text-left max-w-md";
                        } else if (art.layout_type === 'RIGHT_TEXT') {
                            layoutClasses = "flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20";
                            textAlign = "text-left max-w-md";
                        }

                        return (
                            <div key={art.id} className={layoutClasses}>
                                <Link 
                                    to={`/projects/${art.id}`} 
                                    className={`
                                        block shadow-2xl shadow-black/80 hover:opacity-90 transition duration-500
                                        ${art.layout_type === 'CENTER' ? 'w-full max-w-4xl' : 'w-full md:w-1/2'}
                                    `}
                                >
                                    <img 
                                        src={artworkService.getImageUrl(art.image_path)} 
                                        alt={art.title} 
                                        className="w-full h-auto object-contain max-h-[85vh] rounded-sm"
                                    />
                                </Link>

                                <div className={textAlign}>
                                    {/* Назва картини у виставці */}
                                    <h2 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight break-words break-all">{art.title}</h2>
                                    <p className="text-cherry-500 text-xs font-bold mb-8 uppercase tracking-[0.2em] border-b border-cherry-900/30 pb-4 inline-block">
                                        {art.finished_year || 'N/A'}
                                    </p>
                                    
                                    {art.context_description && (
                                        <div className="relative">
                                            <span className="text-cherry-900/50 text-6xl absolute -top-6 -left-4 font-serif">“</span>
                                            <p className="text-bone-200 leading-8 font-serif text-xl italic relative z-10 break-words">
                                                {art.context_description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {collection.items.length === 0 && (
                <div className="text-center text-slate-600 py-10 border border-dashed border-slate-800 rounded mx-4">
                    Тут поки що пусто. Додайте роботи через архів проєктів.
                </div>
            )}
        </div>
    );
};

export default CollectionDetailsPage;