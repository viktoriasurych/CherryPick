import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import artworkService from '../../services/artworkService';
import ArtworkInfoPanel from '../projects/ArtworkInfoPanel';

const ImageModal = ({ artwork: initialArtwork, onClose }) => {
    const [fullArtwork, setFullArtwork] = useState(initialArtwork);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loadingGallery, setLoadingGallery] = useState(false);
    
    // Стан для мобільної шторки
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Закриття по Esc
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Завантаження даних
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

    // --- ФОРМУВАННЯ СПИСКУ ФОТО ---
    const allImages = [];
    const addedPaths = new Set();

    if (fullArtwork.image_path) {
        allImages.push({ id: 'cover_main', src: fullArtwork.image_path, type: 'Cover', isCover: true });
        addedPaths.add(fullArtwork.image_path);
    }

    if (fullArtwork.gallery && Array.isArray(fullArtwork.gallery)) {
        fullArtwork.gallery.forEach(img => {
            if (!addedPaths.has(img.image_path)) {
                allImages.push({ id: `gal_${img.id}`, src: img.image_path, type: 'Detail', isCover: false });
                addedPaths.add(img.image_path);
            }
        });
    }

    const currentSrc = selectedImage || fullArtwork.image_path;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
            
            {/* Оверлей */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Кнопка закриття (ДЕСКТОП: праворуч зовні) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="fixed top-4 right-4 z-[250] p-2 text-white bg-transparent hover:text-blood transition-colors cursor-pointer hidden md:block"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>

            {/* КОНТЕЙНЕР */}
            <div 
                className="relative z-[210] bg-deep md:rounded-sm overflow-hidden shadow-2xl shadow-black border-x md:border border-border w-full md:max-w-7xl h-full md:h-[90vh] flex flex-col lg:flex-row" 
                onClick={(e) => e.stopPropagation()} 
            >
                {/* === ЛІВА ЧАСТИНА (ФОТО) === */}
                <div className="w-full lg:w-2/3 bg-black flex flex-col relative border-b lg:border-b-0 lg:border-r border-border h-full lg:h-full">
                    
                    {/* Кнопка закриття (МОБІЛЬНА: праворуч всередині) */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/40 backdrop-blur-md rounded-full md:hidden border border-white/10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Велике фото */}
                    <div className="flex-1 w-full h-full flex items-center justify-center p-0 md:p-4 overflow-hidden relative">
                        <img 
                            src={artworkService.getImageUrl(currentSrc)} 
                            alt={fullArtwork.title} 
                            className="w-full h-full object-contain shadow-2xl transition-opacity duration-300"
                        />
                    </div>

                    {/* Стрічка мініатюр (Тільки якщо > 1 фото) */}
                    {allImages.length > 1 && (
                        <div className="h-20 bg-void border-t border-border flex items-center gap-3 px-4 overflow-x-auto custom-scrollbar shrink-0 z-20 relative">
                            {allImages.map((img) => {
                                const isSelected = currentSrc === img.src;
                                return (
                                    <div 
                                        key={img.id} 
                                        onClick={() => setSelectedImage(img.src)} 
                                        className={`
                                            min-w-[50px] w-[50px] h-[40px] rounded-sm overflow-hidden border transition-all cursor-pointer relative shrink-0
                                            ${isSelected ? 'border-blood opacity-100' : 'border-border/50 opacity-50'}
                                        `}
                                    >
                                        <img src={artworkService.getImageUrl(img.src)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* === МОБІЛЬНИЙ ІНФО-БАР (ЗНИЗУ) === */}
                    {/* Показується тільки на мобільному, коли шторка закрита */}
                    {!isInfoOpen && (
                        <div 
                            onClick={() => setIsInfoOpen(true)}
                            className="lg:hidden absolute bottom-0 inset-x-0 bg-void/90 backdrop-blur-md border-t border-blood/30 p-4 z-30 cursor-pointer flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] text-blood font-bold uppercase tracking-widest font-mono">Tap for details</span>
                                <h2 className="text-sm font-bold text-bone font-gothic tracking-wide uppercase truncate max-w-[250px]">
                                    {fullArtwork.title}
                                </h2>
                            </div>
                            <ChevronUpIcon className="w-5 h-5 text-muted animate-bounce" />
                        </div>
                    )}
                </div>

                {/* === ПРАВА ЧАСТИНА (ІНФО - ДЕСКТОП) === */}
                <div className="hidden lg:flex w-1/3 flex-col bg-deep h-full border-l border-border">
                    <div className="p-8 border-b border-border shrink-0 bg-void/50 backdrop-blur-md">
                        <h2 className="text-3xl font-bold text-bone font-gothic tracking-wide leading-tight uppercase">
                            {fullArtwork.title}
                        </h2>
                        {fullArtwork.author_name && (
                            <p className="text-xs text-muted mt-2 font-mono uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-[1px] bg-blood"></span>
                                {fullArtwork.author_name}
                            </p>
                        )}
                    </div>
                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-void/20 to-deep">
                        <ArtworkInfoPanel artwork={fullArtwork} showEditButton={false} />
                    </div>
                </div>

                {/* === МОБІЛЬНА ШТОРКА (BOTTOM SHEET) === */}
                <div className={`
                    lg:hidden absolute inset-x-0 bottom-0 z-40 bg-deep border-t border-blood rounded-t-xl shadow-[0_-10px_50px_rgba(0,0,0,0.9)]
                    transition-transform duration-300 ease-out flex flex-col max-h-[85vh]
                    ${isInfoOpen ? 'translate-y-0' : 'translate-y-full'}
                `}>
                    {/* Хедер шторки */}
                    <div 
                        className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between bg-void/50 cursor-pointer"
                        onClick={() => setIsInfoOpen(false)}
                    >
                        <h2 className="text-lg font-bold text-bone font-gothic tracking-wide uppercase truncate pr-4">
                            {fullArtwork.title}
                        </h2>
                        <ChevronDownIcon className="w-5 h-5 text-muted hover:text-white" />
                    </div>

                    {/* Контент шторки */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-deep">
                        <ArtworkInfoPanel artwork={fullArtwork} showEditButton={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;