import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import artworkService from '../services/artworkService';
import ArtworkInfoPanel from './ArtworkInfoPanel'; // 👇 Імпортуємо наш компонент

const ImageModal = ({ artwork, onClose }) => {
    // Локальний стан для вибраного фото в модалці (якщо там є галерея)
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Коли відкриваємо нову картину, скидаємо фото на головне
    useEffect(() => {
        if (artwork) {
            setCurrentImage(artwork.image_path);
        }
    }, [artwork]);

    if (!artwork) return null;

    // Збираємо всі фото для міні-галереї внизу модалки
    // (Якщо бекенд повертає `gallery` разом з artwork у цьому місці)
    // УВАГА: Якщо в об'єкті artwork немає поля gallery, мініатюри не покажуться.
    // Переконайся, що `collectionService.getById` повертає items з полем `gallery` або `images`.
    // Якщо ні - то буде тільки одне фото.
    const allImages = [artwork.image_path];
    if (artwork.gallery && Array.isArray(artwork.gallery)) {
        artwork.gallery.forEach(img => allImages.push(img.image_path));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all hover:rotate-90 focus:outline-none">
                <XMarkIcon className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <div className="relative z-10 bg-slate-950 rounded-2xl overflow-hidden shadow-3xl border border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                
                {/* ЛІВА ЧАСТИНА - ФОТО */}
                <div className="w-full md:w-3/5 lg:w-2/3 bg-black flex flex-col relative">
                    {/* Головне фото */}
                    <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
                        <img 
                            src={artworkService.getImageUrl(currentImage || artwork.image_path)} 
                            alt={artwork.title} 
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    </div>

                    {/* Мініатюри (якщо їх більше 1) */}
                    {allImages.length > 1 && (
                        <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center gap-2 px-4 overflow-x-auto">
                            {allImages.map((src, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setCurrentImage(src)}
                                    className={`h-14 w-14 shrink-0 rounded cursor-pointer overflow-hidden border-2 transition ${currentImage === src ? 'border-cherry-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={artworkService.getImageUrl(src)} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ПРАВА ЧАСТИНА - ДЕТАЛІ (Перевикористовуємо компонент!) */}
                <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col bg-slate-900 border-l border-slate-800">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-2xl font-bold text-white font-serif">{artwork.title}</h2>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar grow">
                        {/* 👇 ОСЬ ВІН! Один компонент на всі випадки життя */}
                        <ArtworkInfoPanel artwork={artwork} showEditButton={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;