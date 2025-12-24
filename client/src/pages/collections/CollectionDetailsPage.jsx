import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    PencilSquareIcon, ArrowLeftIcon, GlobeAltIcon, LockClosedIcon, 
    EyeIcon, BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

import collectionService from '../../services/collectionService';
import artworkService from '../../services/artworkService'; 
import { useAuth } from '../../hooks/useAuth';
import defaultAvatar from '../assets/default-avatar.png';
import ImageModal from '../components/ImageModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import AtmosphereImage from '../../components/ui/AtmosphereImage';

// Обгортка для кліку
const ArtWrapper = ({ artwork, isOwner, setSelectedArtwork, children, className }) => {
    if (isOwner) {
        return <Link to={`/projects/${artwork.id}`} className={className}>{children}</Link>;
    }
    return (
        <div onClick={() => setSelectedArtwork(artwork)} className={`${className} cursor-zoom-in`}>
            {children}
        </div>
    );
};

// --- ВЮШКИ (MOODBOARD, SERIES, EXHIBITION) ---
// (Залишаємо код вюшок без змін, він був правильний)
const MoodboardView = ({ items, ...props }) => (
    <div className="px-4 max-w-[1920px] mx-auto">
        <MasonryGrid>
            {items.map(art => (
                <div key={art.link_id} className="relative group break-inside-avoid mb-4">
                    <ArtWrapper artwork={art} {...props}>
                        <img 
                            src={artworkService.getImageUrl(art.image_path)} 
                            alt={art.title} 
                            className="w-full h-auto object-cover rounded-lg transition duration-500 group-hover:scale-[1.02] group-hover:shadow-xl border border-slate-900" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition rounded-lg flex items-end p-4 pointer-events-none">
                            <span className="text-white text-sm font-bold truncate w-full">{art.title}</span>
                        </div>
                    </ArtWrapper>
                </div>
            ))}
        </MasonryGrid>
    </div>
);

const SeriesView = ({ items, ...props }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 max-w-[1920px] mx-auto">
        {items.map((art) => (
            <div key={art.link_id} className="group flex flex-col h-full">
                <div className="aspect-[4/5] overflow-hidden rounded-sm mb-4 border border-slate-900 relative bg-black">
                    <ArtWrapper artwork={art} className="block w-full h-full" {...props}>
                        <img 
                            src={artworkService.getImageUrl(art.image_path)} 
                            alt={art.title} 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-700" 
                        />
                    </ArtWrapper>
                </div>
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-cherry-400 transition break-words break-all">
                    {art.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{art.finished_year || 'Рік невідомий'}</p>
            </div>
        ))}
    </div>
);

const ExhibitionView = ({ items, ...props }) => (
    <div className="max-w-7xl mx-auto space-y-32 px-4 py-10">
        {items.map((art) => {
            let layoutClasses = "flex flex-col items-center gap-8"; 
            let textAlign = "text-center max-w-lg";
            
            if (art.layout_type === 'LEFT_TEXT') {
                layoutClasses = "flex flex-col md:flex-row items-center gap-12 md:gap-20";
                textAlign = "text-left max-w-md";
            } else if (art.layout_type === 'RIGHT_TEXT') {
                layoutClasses = "flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20";
                textAlign = "text-left max-w-md";
            }

            const imageWrapperClass = art.layout_type === 'CENTER' ? 'w-full max-w-5xl h-[600px]' : 'w-full md:w-1/2 h-[500px] md:h-[600px]';

            return (
                <div key={art.link_id} className={layoutClasses}>
                    <div className={`relative shadow-2xl rounded-sm overflow-hidden border-[8px] border-white bg-black ${imageWrapperClass}`}>
                        <ArtWrapper artwork={art} className="block w-full h-full" {...props}>
                            <AtmosphereImage 
                                src={artworkService.getImageUrl(art.image_path)} 
                                alt={art.title} 
                                className="w-full h-full"
                            />
                        </ArtWrapper>
                    </div>
                    <div className={textAlign}>
                        <h2 className="text-4xl font-bold text-white mb-4 font-serif tracking-tight break-words break-all">{art.title}</h2>
                        <p className="text-cherry-500 text-xs font-bold mb-8 uppercase tracking-[0.2em] border-b border-cherry-900/30 pb-4 inline-block">
                            {art.finished_year || 'N/A'} • {art.material_names || 'Змішана техніка'}
                        </p>
                        {art.context_description && (
                            <div className="relative">
                                <span className="text-cherry-900/50 text-6xl absolute -top-8 -left-6 font-serif">“</span>
                                <p className="text-bone-200 leading-8 font-serif text-lg italic relative z-10 break-words whitespace-pre-wrap">{art.context_description}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

const CollectionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await collectionService.getById(id);
                setCollection(data);
            } catch (error) {
                console.error("Помилка при завантаженні:", error);
                navigate('/collections');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    const handleSaveToggle = async () => {
        if (!user) { navigate('/auth'); return; }
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (collection.is_saved) {
                await collectionService.unsaveCollection(id);
                setCollection(prev => ({ ...prev, is_saved: false, save_count: Math.max(0, (prev.save_count || 0) - 1) }));
            } else {
                await collectionService.saveCollection(id);
                setCollection(prev => ({ ...prev, is_saved: true, save_count: (prev.save_count || 0) + 1 }));
            }
        } catch (error) {
            console.error("Помилка збереження:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Завантаження...</div>;
    if (!collection) return null;

    const isOwner = user && String(user.id) === String(collection.user_id);
    const authorAvatarSrc = collection.author_avatar ? `http://localhost:3000${collection.author_avatar}` : defaultAvatar;
    const viewProps = { isOwner, setSelectedArtwork };

    return (
        <div className="min-h-screen pb-20 relative">
            {/* HEADER */}
            <div className="mb-12 text-center border-b border-slate-900 pb-12 relative px-4 pt-8">
                <div className="absolute top-8 left-4 md:left-8">
                    <Link to="/collections" className="text-slate-500 hover:text-cherry-500 text-sm inline-flex items-center gap-2 transition">
                        <ArrowLeftIcon className="w-4 h-4" /> <span className="hidden sm:inline">Всі колекції</span>
                    </Link>
                </div>

                <div className="absolute top-8 right-4 md:right-8 flex items-center gap-4">
                    {!isOwner && (
                        <button 
                            onClick={handleSaveToggle}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition border ${collection.is_saved ? 'bg-cherry-900/20 text-cherry-400 border-cherry-900/50 hover:bg-cherry-900/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}
                        >
                            {collection.is_saved ? <BookmarkSolidIcon className="w-5 h-5"/> : <BookmarkIcon className="w-5 h-5"/>}
                            <span className="hidden sm:inline">{collection.is_saved ? 'Збережено' : 'Зберегти'}</span>
                        </button>
                    )}
                    {isOwner && (
                        <Link to={`/collections/${id}/edit`} className="text-slate-500 hover:text-white text-sm inline-flex items-center gap-2 transition">
                            <span className="hidden sm:inline">Налаштування</span> <PencilSquareIcon className="w-5 h-5" />
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
                            <Link to={isOwner ? "/profile" : `/user/${collection.author_name}`} className="font-bold text-slate-200 hover:text-cherry-400 transition cursor-pointer">
                                {collection.author_name} {isOwner && "(Ви)"}
                            </Link>
                            <span className="text-slate-700">•</span>
                            <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                            <span className="text-slate-700">•</span>
                            <div className="flex items-center gap-1 text-slate-500" title="Переглядів">
                                <EyeIcon className="w-4 h-4" /> <span>{collection.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 ml-3" title={`Збережено ${collection.save_count || 0} користувачами`}>
                                <BookmarkIcon className="w-4 h-4" /> <span className="text-xs font-bold">{collection.save_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {collection.description && (
                        <p className="text-slate-400 text-lg italic font-serif break-words whitespace-pre-wrap max-w-2xl mx-auto">"{collection.description}"</p>
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

            {/* ВМІСТ */}
            {collection.type === 'MOODBOARD' && <MoodboardView items={collection.items} {...viewProps} />}
            {collection.type === 'SERIES' && <SeriesView items={collection.items} {...viewProps} />}
            {collection.type === 'EXHIBITION' && <ExhibitionView items={collection.items} {...viewProps} />}

            {/* 👇 МОДАЛКА (Передаємо просто artwork і onClose) */}
            <ImageModal 
                    artwork={selectedArtwork} 
                    onClose={() => setSelectedArtwork(null)} 
                />
        </div>
    );
};

export default CollectionDetailsPage;