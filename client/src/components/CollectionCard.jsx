import { Link } from 'react-router-dom';
import { 
    Squares2X2Icon, QueueListIcon, SparklesIcon,
    GlobeAltIcon, LockClosedIcon
} from '@heroicons/react/24/outline';
import artworkService from '../services/artworkService';

// 👇 Імпортуємо ОБИДВІ заглушки
import defaultCollectionImg from '../assets/default-collection.png';
import defaultAvatar from '../assets/default-avatar.png'; 

const CollectionCard = ({ collection }) => {
    
    // 1. Логіка для ОБКЛАДИНКИ колекції
    let coverSrc = defaultCollectionImg;
    if (collection.cover_image) {
        coverSrc = artworkService.getImageUrl(collection.cover_image);
    } else if (collection.latest_image) {
        coverSrc = artworkService.getImageUrl(collection.latest_image);
    }

    // 2. Логіка для АВАТАРКИ автора (якщо є)
    let authorAvatarSrc = defaultAvatar; // За замовчуванням - сірий чоловічок
    if (collection.author_avatar) {
        // Тут краще використати повний шлях, якщо він приходить відносним
        authorAvatarSrc = `http://localhost:3000${collection.author_avatar}`;
    }

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
        <Link 
            to={`/collections/${collection.id}`} 
            className="group block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cherry-900/50 hover:shadow-xl hover:shadow-cherry-900/10 transition duration-300 flex flex-col h-full relative"
        >
            {/* Обкладинка */}
            <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
                <img 
                    src={coverSrc} 
                    alt={collection.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-in-out" 
                />
                
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                     {collection.is_public !== undefined && (
                        <div className="bg-black/70 backdrop-blur p-1.5 rounded-full border border-white/10 text-white">
                            {collection.is_public ? (
                                <GlobeAltIcon className="w-3 h-3 text-green-400" title="Публічна" />
                            ) : (
                                <LockClosedIcon className="w-3 h-3 text-slate-400" title="Приватна" />
                            )}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-white/10 font-mono z-10">
                    {collection.item_count || 0} items
                </div>
            </div>
            
            {/* Інфо */}
            <div className="p-4 flex flex-col grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-slate-200 truncate group-hover:text-cherry-400 transition text-lg w-full">
                        {collection.title}
                    </h3>
                    <div className="shrink-0 bg-slate-900 p-1.5 rounded text-slate-500 border border-slate-800" title={getTypeLabel(collection.type)}>
                        {getTypeIcon(collection.type)}
                    </div>
                </div>
                
                {/* 👇 АВТОР: Використовуємо правильну змінну authorAvatarSrc */}
                {collection.author_name && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                             <img 
                                src={authorAvatarSrc} 
                                alt={collection.author_name} 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        <span className="text-xs text-slate-400 font-bold hover:text-white transition">
                            {collection.author_name}
                        </span>
                    </div>
                )}

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {collection.description || <span className="italic opacity-30">Опис відсутній</span>}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                        {getTypeLabel(collection.type)}
                    </span>
                    <span className="text-[10px] text-slate-600 group-hover:text-cherry-400 transition">
                        Переглянути &rarr;
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default CollectionCard;