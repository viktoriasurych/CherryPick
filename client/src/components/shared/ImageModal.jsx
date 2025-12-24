import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import artworkService from '../../services/artworkService';
import ArtworkInfoPanel from './ArtworkInfoPanel'; 

const ImageModal = ({ artwork: initialArtwork, onClose }) => {
    const [fullArtwork, setFullArtwork] = useState(initialArtwork);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loadingGallery, setLoadingGallery] = useState(false);

    // Закриття по Esc
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Завантаження
    useEffect(() => {
        if (!initialArtwork) {
            setFullArtwork(null);
            return;
        }

        setFullArtwork(initialArtwork);
        setSelectedImage(initialArtwork.image_path);
        
        if (!initialArtwork.gallery) {
            setLoadingGallery(true);
            artworkService.getById(initialArtwork.id || initialArtwork.artwork_id)
                .then(data => setFullArtwork(data))
                .catch(console.error)
                .finally(() => setLoadingGallery(false));
        }
    }, [initialArtwork]);

    if (!fullArtwork) return null;

    // --- ФОРМУВАННЯ СПИСКУ ---
    const allImages = [];
    const addedPaths = new Set();

    // 1. Обкладинка
    if (fullArtwork.image_path) {
        allImages.push({ 
            id: 'cover_main', 
            src: fullArtwork.image_path, 
            type: 'Обкладинка',
            isCover: true 
        });
        addedPaths.add(fullArtwork.image_path);
    }

    // 2. Галерея (Тільки авторська)
    if (fullArtwork.gallery && Array.isArray(fullArtwork.gallery)) {
        fullArtwork.gallery.forEach(img => {
            if (!addedPaths.has(img.image_path)) {
                allImages.push({ 
                    id: `gal_${img.id}`, 
                    src: img.image_path, 
                    type: 'Деталь', 
                    isCover: false 
                });
                addedPaths.add(img.image_path);
            }
        });
    }

    const currentSrc = selectedImage || fullArtwork.image_path;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200">
            
            {/* Оверлей - Клік закриває */}
            <div 
                className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Кнопка закриття (Фіксована) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="fixed top-4 right-4 z-[220] p-2 md:p-3 text-slate-400 hover:text-white bg-black/50 hover:bg-slate-800 rounded-full transition-all cursor-pointer border border-slate-700/50"
            >
                <XMarkIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* КОНТЕЙНЕР КОНТЕНТУ */}
            <div 
                className="relative z-[210] bg-slate-950 md:rounded-2xl overflow-hidden shadow-2xl border-x md:border border-slate-800 w-full md:max-w-7xl h-full md:h-[85vh] flex flex-col lg:flex-row" 
                onClick={(e) => e.stopPropagation()} 
            >
                {/* ЛІВА ЧАСТИНА (ФОТО) */}
                <div className="w-full lg:w-2/3 bg-black flex flex-col relative border-b lg:border-b-0 lg:border-r border-slate-800 h-[50vh] lg:h-full">
                    
                    {/* Велике фото */}
                    <div className="flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden relative">
                        <img 
                            src={artworkService.getImageUrl(currentSrc)} 
                            alt={fullArtwork.title} 
                            className="w-full h-full object-contain shadow-2xl transition-opacity duration-300"
                        />
                    </div>

                    {/* 👇 СТРІЧКА МІНІАТЮР (ЗАВЖДИ ПОКАЗУЄМО, навіть якщо 1 фото) */}
                    {/* Це прибирає ефект "стрибання" інтерфейсу */}
                    <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center gap-3 px-4 overflow-x-auto custom-scrollbar shrink-0">
                        {loadingGallery && allImages.length <= 1 && (
                            <span className="text-xs text-slate-500 animate-pulse ml-2">...</span>
                        )}

                        {allImages.map((img) => {
                            const isSelected = currentSrc === img.src;
                            return (
                                <div 
                                    key={img.id} 
                                    onClick={() => setSelectedImage(img.src)} 
                                    className="flex flex-col items-center gap-1 cursor-pointer group shrink-0 py-2"
                                >
                                    <div className={`
                                        min-w-[50px] w-[50px] h-[40px] rounded overflow-hidden border-2 transition relative
                                        ${isSelected ? 'border-cherry-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}
                                    `}>
                                        <img src={artworkService.getImageUrl(img.src)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    
                                    {/* Підпис тільки для обкладинки */}
                                    {img.isCover && (
                                        <span className="text-[8px] text-cherry-500 font-bold uppercase tracking-wider leading-none">
                                            Обкладинка
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА (ІНФО) */}
                <div className="w-full lg:w-1/3 flex flex-col bg-slate-950 h-[50vh] lg:h-full">
                    <div className="p-4 md:p-6 border-b border-slate-800 shrink-0">
                        <h2 className="text-xl md:text-2xl font-bold text-white font-serif line-clamp-2 pr-8">{fullArtwork.title}</h2>
                        {fullArtwork.author_name && (
                            <p className="text-xs md:text-sm text-slate-500 mt-1">Автор: <span className="text-slate-300">{fullArtwork.author_name}</span></p>
                        )}
                    </div>
                    
                    <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 pb-20 md:pb-6">
                        <ArtworkInfoPanel artwork={fullArtwork} showEditButton={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;