import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    PencilSquareIcon, ArrowLeftIcon, GlobeAltIcon, LockClosedIcon, 
    EyeIcon, BookmarkIcon, CheckIcon // 👈 Додали іконки
} from '@heroicons/react/24/outline';
// Для зафарбованої іконки "Збережено"
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

import collectionService from '../services/collectionService';
import artworkService from '../services/artworkService';
import { useAuth } from '../hooks/useAuth';
import defaultAvatar from '../assets/default-avatar.png';
import ImageModal from '../components/ImageModal';

const CollectionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    
    // 👇 Стан кнопки збереження
    const [isSaved, setIsSaved] = useState(false);
    const [saveCount, setSaveCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false); // Щоб не клікали 100 разів

    useEffect(() => {
        const load = async () => {
            try {
                const data = await collectionService.getById(id);
                setCollection(data);
                
                // Якщо бекенд повертає ці поля (ми їх додали в DAO getById)
                if (data.is_saved !== undefined) setIsSaved(data.is_saved);
                // Для saveCount нам треба було б додати це в DAO, 
                // але поки можемо просто показати те, що є, або 0.
                // Якщо ти хочеш реальну цифру, треба додати COUNT в SQL запит getById.
                // Поки що нехай буде заглушка або реальне, якщо додали.
            } catch (error) {
                console.error("Помилка при завантаженні:", error);
                navigate('/collections');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    // 👇 ОНОВЛЕНА ЛОГІКА З МИТТЄВОЮ ЗМІНОЮ ЦИФР
    const handleSaveToggle = async () => {
        if (!user) {
            navigate('/auth'); 
            return;
        }
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (isSaved) {
                // 1. Видаляємо на сервері
                await collectionService.unsaveCollection(id);
                
                // 2. МИТТЄВО оновлюємо кнопку
                setIsSaved(false);
                
                // 3. МИТТЄВО оновлюємо цифру в об'єкті collection
                setCollection(prev => ({
                    ...prev,
                    save_count: Math.max(0, (prev.save_count || 0) - 1) // Зменшуємо на 1, але не нижче 0
                }));

            } else {
                // 1. Зберігаємо на сервері
                await collectionService.saveCollection(id);
                
                // 2. МИТТЄВО оновлюємо кнопку
                setIsSaved(true);
                
                // 3. МИТТЄВО оновлюємо цифру
                setCollection(prev => ({
                    ...prev,
                    save_count: (prev.save_count || 0) + 1 // Збільшуємо на 1
                }));
            }
        } catch (error) {
            console.error("Помилка збереження:", error);
            // Якщо сталася помилка, можна відкотити зміни назад (опціонально)
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Завантаження...</div>;
    if (!collection) return null;

    const isOwner = user && String(user.id) === String(collection.user_id);
    const authorAvatarSrc = collection.author_avatar ? `http://localhost:3000${collection.author_avatar}` : defaultAvatar;

    const ArtWrapper = ({ artwork, children, className }) => {
        if (isOwner) {
            return <Link to={`/projects/${artwork.id}`} className={className}>{children}</Link>;
        } else {
            return (
                <div onClick={() => setSelectedArtwork(artwork)} className={`${className} cursor-zoom-in`}>
                    {children}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen pb-20 relative">
            
            <div className="mb-12 text-center border-b border-slate-900 pb-12 relative px-4 pt-8">
                
                {/* КНОПКА НАЗАД */}
                <div className="absolute top-8 left-4 md:left-8">
                    <Link to="/collections" className="text-slate-500 hover:text-cherry-500 text-sm inline-flex items-center gap-2 transition">
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Всі колекції</span>
                    </Link>
                </div>

                {/* ПРАВА ВЕРХНЯ ЧАСТИНА (Налаштування АБО Зберегти) */}
                <div className="absolute top-8 right-4 md:right-8 flex items-center gap-4">
                    
                    {/* 👇 КНОПКА ЗБЕРЕГТИ (Тільки якщо я НЕ власник) */}
                    {!isOwner && (
                        <button 
                            onClick={handleSaveToggle}
                            disabled={isSaving}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition border
                                ${isSaved 
                                    ? 'bg-cherry-900/20 text-cherry-400 border-cherry-900/50 hover:bg-cherry-900/30' 
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}
                            `}
                        >
                            {isSaved ? <BookmarkSolidIcon className="w-5 h-5"/> : <BookmarkIcon className="w-5 h-5"/>}
                            <span className="hidden sm:inline">{isSaved ? 'Збережено' : 'Зберегти'}</span>
                        </button>
                    )}

                    {/* КНОПКА НАЛАШТУВАННЯ (Тільки для власника) */}
                    {isOwner && (
                        <Link to={`/collections/${id}/edit`} className="text-slate-500 hover:text-white text-sm inline-flex items-center gap-2 transition">
                            <span className="hidden sm:inline">Налаштування</span>
                            <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                    )}
                </div>

                <div className="max-w-4xl mx-auto mt-16 md:mt-0 px-2">
                    <h1 className="text-4xl md:text-6xl font-bold text-cherry-500 font-pixel tracking-wider mb-6 uppercase break-words break-all leading-tight">
                        {collection.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shadow-sm">
                            <img src={authorAvatarSrc} alt="Author" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-3">
                            <Link 
                                to={isOwner ? "/profile" : `/user/${collection.user_id}`} 
                                className="font-bold text-slate-200 hover:text-cherry-400 transition cursor-pointer"
                            >
                                {collection.author_name} {isOwner && "(Ви)"}
                            </Link>
                            
                            <span className="text-slate-700">•</span>
                            <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                            
                            {/* СТАТИСТИКА: Перегляди */}
                            <span className="text-slate-700">•</span>
                            <div className="flex items-center gap-1 text-slate-500" title="Переглядів">
                                <EyeIcon className="w-4 h-4" />
                                <span>{collection.views || 0}</span>
                            </div>

                           {/* 👇 СТАТИСТИКА: Збереження */}
                           <div className="flex items-center gap-1.5 text-slate-500 ml-3" title={`Збережено ${collection.save_count || 0} користувачами`}>
                                <BookmarkIcon className="w-4 h-4" />
                                <span className="text-xs font-bold">{collection.save_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {collection.description && (
                        <p className="text-slate-400 text-lg italic font-serif break-words whitespace-pre-wrap max-w-2xl mx-auto">
                            "{collection.description}"
                        </p>
                    )}

                    <div className="mt-6 flex justify-center flex-wrap gap-2">
                        <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-xs text-slate-500 uppercase tracking-widest font-bold">
                            {collection.type}
                        </span>
                        <span className={`border px-3 py-1 rounded text-xs uppercase tracking-widest font-bold flex items-center gap-1 ${collection.is_public ? 'border-green-900 text-green-600 bg-green-900/10' : 'border-slate-800 text-slate-600 bg-slate-900'}`}>
                            {collection.is_public ? <GlobeAltIcon className="w-3 h-3"/> : <LockClosedIcon className="w-3 h-3"/>}
                            {collection.is_public ? 'Публічна' : 'Приватна'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ВМІСТ (Moodboard, Series, Exhibition) залишається без змін... */}
            {collection.type === 'MOODBOARD' && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-4 max-w-[1600px] mx-auto">
                    {collection.items.map(art => (
                        <div key={art.link_id} className="relative group break-inside-avoid">
                            <ArtWrapper artwork={art}>
                                <img src={artworkService.getImageUrl(art.image_path)} alt={art.title} className="w-full h-auto object-cover rounded-lg transition duration-500 group-hover:scale-[1.02] group-hover:shadow-xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition rounded-lg flex items-end p-4 pointer-events-none">
                                    <span className="text-white text-sm font-bold truncate w-full">{art.title}</span>
                                </div>
                            </ArtWrapper>
                        </div>
                    ))}
                </div>
            )}
            
            {/* ... SERIES та EXHIBITION код такий самий ... */}
            {collection.type === 'SERIES' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
                 {collection.items.map((art, idx) => (
                     <div key={art.link_id} className="group">
                         <div className="aspect-[4/5] overflow-hidden rounded-sm mb-4 border border-slate-900 relative">
                             <span className="absolute top-2 left-2 text-[100px] leading-none font-bold text-white/5 z-10 pointer-events-none select-none font-pixel">
                                 {String(idx + 1).padStart(2, '0')}
                             </span>
                             <ArtWrapper artwork={art} className="block w-full h-full">
                                 <img src={artworkService.getImageUrl(art.image_path)} alt={art.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700" />
                             </ArtWrapper>
                         </div>
                         <h3 className="text-xl font-bold text-slate-200 group-hover:text-cherry-400 transition break-words break-all">{art.title}</h3>
                         <p className="text-sm text-slate-500 mt-1">{art.finished_year || 'Рік невідомий'}</p>
                     </div>
                 ))}
             </div>
            )}

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
                            <div key={art.link_id} className={layoutClasses}>
                                <div className={`relative shadow-2xl ${art.layout_type === 'CENTER' ? 'w-full max-w-4xl aspect-video' : 'w-full md:w-1/2 aspect-[4/5]'}`}>
                                    <div onClick={() => setSelectedArtwork(art)} className="cursor-zoom-in w-full h-full block">
                                         <img src={artworkService.getImageUrl(art.image_path)} alt={art.title} className="w-full h-full object-cover border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                                    </div>
                                </div>
                                <div className={textAlign}>
                                    <h2 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight break-words break-all">{art.title}</h2>
                                    <p className="text-cherry-500 text-xs font-bold mb-8 uppercase tracking-[0.2em] border-b border-cherry-900/30 pb-4 inline-block">{art.finished_year || 'N/A'}</p>
                                    {art.context_description && (
                                        <div className="relative">
                                            <span className="text-cherry-900/50 text-6xl absolute -top-6 -left-4 font-serif">“</span>
                                            <p className="text-bone-200 leading-8 font-serif text-xl italic relative z-10 break-words whitespace-pre-wrap">{art.context_description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ImageModal 
                artwork={selectedArtwork} 
                onClose={() => setSelectedArtwork(null)} 
            />

        </div>
    );
};

export default CollectionDetailsPage;