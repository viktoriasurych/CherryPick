import { Link } from 'react-router-dom';
import { 
    Squares2X2Icon, QueueListIcon, SparklesIcon,
    GlobeAltIcon, LockClosedIcon, TrashIcon
} from '@heroicons/react/24/outline';
import artworkService from '../../services/artworkService';
import { useAuth } from '../../hooks/useAuth'; 

import defaultCollectionImg from '../../assets/default-collection.png';
import defaultAvatar from '../../assets/default-avatar.png';

const CollectionCard = ({ collection, onUnsave }) => {
    const { user } = useAuth();
    
    let coverSrc = defaultCollectionImg;
    if (collection.cover_image) {
        coverSrc = artworkService.getImageUrl(collection.cover_image);
    } else if (collection.latest_image) {
        coverSrc = artworkService.getImageUrl(collection.latest_image);
    }

    let authorAvatarSrc = defaultAvatar;
    if (collection.author_avatar) {
        authorAvatarSrc = `http://localhost:3000${collection.author_avatar}`;
    }

    const isOwner = user && String(user.id) === String(collection.user_id);
    const isPrivate = !collection.is_public;
    const isAccessDenied = !isOwner && isPrivate;

    const dateLabel = collection.updated_at ? 'UPD' : 'CRE';
    const dateValue = collection.updated_at || collection.created_at;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'MOODBOARD': return <Squares2X2Icon className="w-3 h-3" />;
            case 'SERIES': return <QueueListIcon className="w-3 h-3" />;
            case 'EXHIBITION': return <SparklesIcon className="w-3 h-3" />;
            default: return null;
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'MOODBOARD': return 'Moodboard';
            case 'SERIES': return 'Series';
            case 'EXHIBITION': return 'Exhibition';
            default: return type;
        }
    };

    const CardContent = () => (
        <>
            {/* 1. ОБКЛАДИНКА (4/3) */}
            <div className="aspect-[4/3] w-full bg-black relative overflow-hidden flex items-center justify-center border-b border-border/30">
                {isAccessDenied ? (
                    <div className="flex flex-col items-center text-blood gap-2 animate-pulse">
                        <LockClosedIcon className="w-10 h-10 opacity-80" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                            LOCKED
                        </span>
                    </div>
                ) : (
                    <>
                        <img 
                            src={coverSrc} 
                            alt={collection.title} 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-in-out" 
                        />
                        
                        {/* Статус (ЗПРАВА ЗВЕРХУ) */}
                        <div className={`
                            absolute top-3 right-3 px-2 py-1 
                            text-[9px] font-bold uppercase tracking-[0.15em] 
                            border backdrop-blur-sm shadow-md font-mono flex items-center gap-1.5
                            ${collection.is_public 
                                ? 'bg-ash text-bone border-border' 
                                : 'bg-black text-blood border-blood/50'}
                        `}>
                            {collection.is_public ? <GlobeAltIcon className="w-3 h-3"/> : <LockClosedIcon className="w-3 h-3"/>}
                            {collection.is_public ? 'PUBLIC' : 'PRIVATE'}
                        </div>
                    </>
                )}
            </div>
            
            {/* 2. ІНФОРМАЦІЯ */}
            <div className="p-5 flex flex-col grow relative">
                
                {isAccessDenied ? (
                    <div className="flex flex-col h-full justify-center text-center gap-6">
                        <div className="space-y-2">
                            <p className="text-blood text-sm font-bold uppercase tracking-widest font-mono">
                                Access Denied
                            </p>
                            <p className="text-muted/60 text-[9px] uppercase tracking-wider leading-relaxed px-4">
                                This collection is private.
                            </p>
                        </div>
                        
                        {onUnsave && (
                            <button 
                                onClick={(e) => { e.preventDefault(); onUnsave(collection.id); }}
                                className="text-blood border-blood/50 hover:bg-blood hover:text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 py-2 border rounded-sm transition w-full shadow-md hover:shadow-blood/20"
                            >
                                <TrashIcon className="w-3 h-3" /> Remove
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Назва */}
                        <h3 className="text-sm font-bold text-bone group-hover:text-blood transition-colors truncate mb-3 uppercase tracking-wide font-mono">
                            {collection.title}
                        </h3>
                        
                        {/* Тип • Кількість елементів */}
                        <div className="flex items-center justify-between mb-4 min-h-[20px]">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center gap-1.5 bg-ash px-2 py-0.5 rounded-sm border border-border/50 text-[9px] text-muted uppercase tracking-wider font-mono hover:text-bone transition-colors hover:border-border">
                                    <span className="text-bone">
                                        {getTypeIcon(collection.type)}
                                    </span>
                                    <span>{getTypeLabel(collection.type)}</span>
                                </div>
                                
                                <span className="text-muted/30 font-bold">•</span>
                                
                                <span className="text-[10px] text-muted font-mono">{collection.item_count || 0} items</span>
                            </div>
                        </div>

                        {/* Опис */}
                        {collection.description && (
                            <p className="text-[10px] text-muted/70 line-clamp-2 leading-relaxed font-mono mb-4">
                                {collection.description}
                            </p>
                        )}
                        
                        {/* ФУТЕР */}
                        <div className="mt-auto pt-3 border-t border-border/30 flex justify-between items-end">
                            
                            {/* ЛІВО: Дата */}
                            <span className="text-[9px] text-muted/60 font-mono uppercase tracking-widest">
                                {dateLabel}: {formatDate(dateValue)}
                            </span>

                            {/* ПРАВО: Автор */}
                            {collection.author_name ? (
                                <div className="flex items-center gap-2 group/author">
                                    <span className="text-[10px] text-muted font-bold group-hover/author:text-bone transition font-mono truncate max-w-[80px]">
                                        {collection.author_name}
                                    </span>
                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-ash border border-border group-hover/author:border-blood transition-colors">
                                         <img 
                                            src={authorAvatarSrc} 
                                            alt={collection.author_name} 
                                            className="w-full h-full object-cover opacity-80"
                                         />
                                    </div>
                                </div>
                            ) : <div></div>}
                        </div>
                    </>
                )}
            </div>
        </>
    );

    if (isAccessDenied) {
        return (
            <div className="
                block bg-void border border-border/50 rounded-sm overflow-hidden 
                flex flex-col h-full opacity-70 hover:opacity-100 transition-opacity 
                shadow-lg shadow-black/40
            ">
                <CardContent />
            </div>
        );
    }

    return (
        <Link 
            to={`/collections/${collection.id}`} 
            className="
                group block bg-void border border-border rounded-sm overflow-hidden 
                hover:border-blood transition-all duration-500 
                shadow-lg shadow-black/40 hover:shadow-[0_0_20px_rgba(159,18,57,0.2)] 
                flex flex-col h-full
            "
        >
            <CardContent />
        </Link>
    );
};

export default CollectionCard;