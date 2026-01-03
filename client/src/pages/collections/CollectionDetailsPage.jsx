import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    PencilSquareIcon, ArrowLongLeftIcon, GlobeAltIcon, LockClosedIcon, 
    EyeIcon, BookmarkIcon, Squares2X2Icon, QueueListIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

import collectionService from '../../services/collectionService';
import artworkService from '../../services/artworkService'; 
import { useAuth } from '../../hooks/useAuth';

import defaultAvatar from '../../assets/default-avatar.png';
import ImageModal from '../../components/shared/ImageModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import AtmosphereImage from '../../components/ui/AtmosphereImage';

// --- ДОПОМІЖНІ ФУНКЦІЇ ---
const getTypeIcon = (type) => {
    switch (type) {
        case 'MOODBOARD': return Squares2X2Icon;
        case 'SERIES': return QueueListIcon;
        case 'EXHIBITION': return SparklesIcon;
        default: return Squares2X2Icon;
    }
};

// --- ЕЛЕМЕНТИ ГАЛЕРЕЇ ---
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

const MoodboardView = ({ items, ...props }) => (
    <div className="px-4 max-w-[1920px] mx-auto animate-in fade-in duration-700">
        <MasonryGrid>
            {items.map(art => (
                <div key={art.link_id} className="relative group break-inside-avoid mb-4">
                    <ArtWrapper artwork={art} {...props}>
                        <div className="relative overflow-hidden rounded-sm border border-border group-hover:border-blood/50 transition-colors duration-500 bg-black">
                            <img src={artworkService.getImageUrl(art.image_path)} alt={art.title} className="w-full h-auto object-cover transition duration-700 group-hover:scale-[1.02] opacity-90 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4 pointer-events-none">
                                <span className="text-bone text-xs font-bold truncate w-full uppercase tracking-widest font-gothic drop-shadow-md">{art.title}</span>
                            </div>
                        </div>
                    </ArtWrapper>
                </div>
            ))}
        </MasonryGrid>
    </div>
);

// 👇 ОНОВЛЕНИЙ SERIES VIEW (Без номерів, з жанром/стилем)
const SeriesView = ({ items, ...props }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 max-w-[1920px] mx-auto animate-in fade-in duration-700">
        {items.map((art, index) => (
            <div key={art.link_id} className="group flex flex-col h-full bg-void border border-border hover:border-blood/30 transition-colors rounded-sm p-2 shadow-sm hover:shadow-md">
                <div className="aspect-[4/5] overflow-hidden rounded-sm mb-3 border border-border relative bg-black">
                    <ArtWrapper artwork={art} className="block w-full h-full" {...props}>
                        <img 
                            src={artworkService.getImageUrl(art.image_path)} 
                            alt={art.title} 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-700" 
                        />
                    </ArtWrapper>
                    {/* Номерацію прибрано */}
                </div>
                
                <div className="mt-auto px-1 pb-1">
                    {/* Назва */}
                    <h3 className="text-sm font-bold text-bone group-hover:text-blood transition-colors break-words break-all uppercase tracking-wide font-gothic leading-tight mb-1">
                        {art.title}
                    </h3>
                    
                    {/* Рік */}
                    <p className="text-[10px] text-muted font-mono uppercase tracking-wider opacity-60 mb-2">
                        {art.finished_year || '—'}
                    </p>

                    {/* Жанр | Стиль (Новий рядок) */}
                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted/50 font-mono uppercase tracking-wider border-t border-border/30 pt-2">
                        <span className="truncate max-w-[45%]">{art.genre_name || 'N/A'}</span>
                        <span className="text-blood/40">|</span>
                        <span className="truncate max-w-[45%]">{art.style_name || 'N/A'}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ExhibitionView = ({ items, ...props }) => (
    <div className="max-w-6xl mx-auto space-y-32 px-6 py-10 animate-in fade-in duration-1000">
        {items.map((art, index) => {
            let layoutClasses = "flex flex-col items-center gap-12"; 
            let textAlign = "text-center max-w-xl w-full";
            
            if (art.layout_type === 'LEFT_TEXT') {
                layoutClasses = "flex flex-col md:flex-row items-center gap-16";
                textAlign = "text-left max-w-md w-full";
            } else if (art.layout_type === 'RIGHT_TEXT') {
                layoutClasses = "flex flex-col md:flex-row-reverse items-center gap-16";
                textAlign = "text-left max-w-md w-full";
            }

            const imageWrapperClass = art.layout_type === 'CENTER' 
                ? 'w-full max-w-4xl h-[60vh]' 
                : 'w-full md:w-1/2 h-[50vh] md:h-[70vh]';

            return (
                <div key={art.link_id} className={layoutClasses}>
                    
                    {/* КАРТИНА */}
                    <div className={`relative overflow-hidden border border-border bg-black group ${imageWrapperClass}`}>
                        <ArtWrapper artwork={art} className="block w-full h-full" {...props}>
                            <AtmosphereImage 
                                src={artworkService.getImageUrl(art.image_path)} 
                                alt={art.title} 
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.01] transition duration-[1.5s]"
                            />
                        </ArtWrapper>
                    </div>
                    
                    {/* ТЕКСТ */}
                    <div className={textAlign}>
                        {/* 1. НАЗВА */}
                        <h2 className="text-3xl md:text-4xl font-bold text-bone font-gothic tracking-wide uppercase leading-tight mb-3 break-words hyphens-auto">
                            {art.title}
                        </h2>

                        {/* 2. РІК • ЖАНР • СТИЛЬ */}
                        <div className={`flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted/60 uppercase tracking-[0.15em] mb-6 font-mono ${art.layout_type === 'CENTER' ? 'justify-center' : 'justify-start'}`}>
                            <span className="text-bone/80">{art.finished_year || 'Year N/A'}</span>
                            <span className="text-muted/40">|</span>
                            <span className="whitespace-nowrap"><span className="text-blood">Genre:</span> {art.genre_name || 'N/A'}</span>
                            <span className="text-muted/40">|</span>
                            <span className="whitespace-nowrap"><span className="text-blood">Style:</span> {art.style_name || 'N/A'}</span>
                        </div>
                        
                        {/* 3. ОПИС */}
                        {art.context_description && (
                            <div className={`border-l-2 border-blood/40 pl-6 py-1 ${art.layout_type === 'CENTER' ? 'text-left max-w-2xl mx-auto' : ''}`}>
                                <p className="text-bone/80 text-sm leading-relaxed font-mono uppercase tracking-wide whitespace-pre-wrap break-words">
                                    {art.context_description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

// --- ГОЛОВНА СТОРІНКА ---

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
                console.error("Error:", error);
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
        } catch (error) { console.error("Save Error:", error); } 
        finally { setIsSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted animate-pulse font-mono"><span className="text-xs uppercase tracking-[0.3em]">Summoning...</span></div>;
    if (!collection) return null;

    const isOwner = user && String(user.id) === String(collection.user_id);
    const authorAvatarSrc = collection.author_avatar ? artworkService.getImageUrl(collection.author_avatar) : defaultAvatar;
    const viewProps = { isOwner, setSelectedArtwork };
    const TypeIcon = getTypeIcon(collection.type);

    return (
        <div className="min-h-screen pb-40 font-mono bg-void text-bone selection:bg-blood selection:text-white">
            
            {/* --- HEADER WRAPPER --- */}
            <div className="pt-8 pb-8 px-4 md:px-8 mb-8 border-b border-border/30">
                <div className="max-w-[1920px] mx-auto">
                    
                    {/* 1. TOP CONTROL PANEL */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-12">
                        
                        {/* ЛІВО: Кнопка Назад */}
                        <div className="mb-6 md:mb-0 self-start">
                            <Link to="/collections" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-bone transition-colors">
                                <ArrowLongLeftIcon className="w-4 h-4 text-blood group-hover:-translate-x-1 transition-transform" />
                                <span>Back</span>
                            </Link>
                        </div>

                        {/* ПРАВО: Бейджі + Кнопка */}
                        <div className="w-full md:w-auto flex flex-wrap justify-between md:justify-end items-center gap-4">
                            
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border text-[9px] font-bold uppercase tracking-[0.15em] text-muted/80">
                                    <TypeIcon className="w-3 h-3" />
                                    <span className="hidden sm:inline">{collection.type}</span>
                                </div>

                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-[0.15em] ${collection.is_public ? 'border-border text-muted/80' : 'border-blood/40 text-blood'}`}>
                                    {collection.is_public ? <GlobeAltIcon className="w-3 h-3"/> : <LockClosedIcon className="w-3 h-3"/>}
                                    <span className="hidden sm:inline">{collection.is_public ? 'Public' : 'Private'}</span>
                                </div>
                            </div>

                            <span className="text-muted/40 hidden md:block">|</span>

                            {/* Кнопка Дії */}
                            <div>
                                {!isOwner ? (
                                    <button 
                                        onClick={handleSaveToggle}
                                        disabled={isSaving}
                                        className={`
                                            flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all border
                                            ${collection.is_saved 
                                                ? 'bg-blood border-blood text-white shadow-[0_0_15px_rgba(159,18,57,0.4)]' 
                                                : 'bg-transparent text-bone border-bone/30 hover:border-blood hover:text-blood hover:shadow-[0_0_10px_rgba(159,18,57,0.2)]'}
                                        `}
                                    >
                                        {collection.is_saved ? <BookmarkSolidIcon className="w-3 h-3"/> : <BookmarkIcon className="w-3 h-3"/>}
                                        <span className="hidden sm:inline">{collection.is_saved ? 'Saved' : 'Save'}</span>
                                    </button>
                                ) : (
                                    <Link 
                                        to={`/collections/${id}/edit`} 
                                        className="flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all border bg-transparent text-bone border-bone/30 hover:bg-blood hover:border-blood hover:text-white hover:shadow-[0_0_15px_rgba(159,18,57,0.3)]"
                                    >
                                        <span className="hidden sm:inline">Edit</span> 
                                        <PencilSquareIcon className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. CENTER CONTENT */}
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-bone font-gothic tracking-widest mb-6 uppercase leading-tight drop-shadow-2xl break-words hyphens-auto max-w-full">
                            {collection.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted font-mono uppercase tracking-wider mb-8">
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-border group-hover:border-blood transition-all">
                                    <img src={authorAvatarSrc} alt={collection.author_name} className="w-full h-full object-cover" />
                                </div>
                                <Link to={isOwner ? "/profile" : `/user/${collection.author_name}`} className="transition-colors font-bold hover:text-blood">
                                    {collection.author_name}
                                </Link>
                            </div>
                            
                            <span className="text-muted/40">|</span>
                            <span>{new Date(collection.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                            <span className="text-muted/40">|</span>
                            
                            <div className="flex items-center gap-3 opacity-60">
                                <div className="flex items-center gap-1" title="Views"><EyeIcon className="w-3 h-3" /> <span>{collection.views || 0}</span></div>
                                <div className="flex items-center gap-1" title="Saves"><BookmarkIcon className="w-3 h-3" /> <span>{collection.save_count || 0}</span></div>
                            </div>
                        </div>

                        {collection.description && (
                            <div className="relative inline-block px-10 max-w-2xl mx-auto">
                                <span className="absolute top-0 left-0 text-3xl text-blood/40 font-gothic leading-none">“</span>
                                <p className="text-muted text-sm leading-relaxed font-mono break-words">{collection.description}</p>
                                <span className="absolute bottom-0 right-0 text-3xl text-blood/40 font-gothic leading-none">”</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 pb-20">
                {collection.type === 'MOODBOARD' && <MoodboardView items={collection.items} {...viewProps} />}
                {collection.type === 'SERIES' && <SeriesView items={collection.items} {...viewProps} />}
                {collection.type === 'EXHIBITION' && <ExhibitionView items={collection.items} {...viewProps} />}
                
                {collection.items?.length === 0 && (
                    <div className="text-center py-20 text-muted opacity-40 font-mono uppercase tracking-widest flex flex-col items-center gap-3">
                        <div className="w-8 h-px bg-blood/50 mb-2"></div>
                        The Void is Empty
                        {isOwner && <Link to="/projects" className="text-[10px] text-blood hover:text-white border-b border-blood/30 pb-0.5 transition-colors">Add Artifacts</Link>}
                    </div>
                )}
            </div>

            <ImageModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
        </div>
    );
};

export default CollectionDetailsPage;