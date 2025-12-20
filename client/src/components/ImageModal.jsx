import { XMarkIcon } from '@heroicons/react/24/outline';
import artworkService from '../services/artworkService';
import { useEffect } from 'react';

const ImageModal = ({ artwork, onClose }) => {
    // Закриття на клавішу ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!artwork) return null;

    return (
        // 1. Фон-оверлей (на весь екран, темний, при кліку закриває)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
        >
            {/* Напівпрозорий чорний фон */}
            <div 
                className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity" 
                onClick={onClose} // Клік по фону закриває модалку
            ></div>

            {/* 2. Кнопка "Закрити" (Велика, справа зверху) */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all hover:rotate-90 focus:outline-none"
                title="Закрити (Esc)"
            >
                <XMarkIcon className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            {/* 3. Головний контейнер модалки (Білий/Темний блок по центру) */}
            <div 
                className="relative z-10 bg-slate-950 rounded-2xl overflow-hidden shadow-3xl border border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()} // Щоб клік по самому вікну не закривав його
            >
                
                {/* ЛІВА ЧАСТИНА - ФОТО (Займає більше місця) */}
                <div className="w-full md:w-3/5 lg:w-2/3 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-full">
                    <img 
                        src={artworkService.getImageUrl(artwork.image_path)} 
                        alt={artwork.title} 
                        className="max-w-full max-h-full object-contain p-4"
                    />
                </div>

                {/* ПРАВА ЧАСТИНА - ДЕТАЛІ (Фіксована ширина, прокрутка якщо багато тексту) */}
                <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col bg-slate-900/95 md:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 relative">
                    
                    {/* Верхня частина деталей */}
                    <div className="p-6 md:p-8 border-b border-slate-800 shrink-0">
                        <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3 leading-tight break-words">{artwork.title}</h2>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider">
                            <span className="text-cherry-400 bg-cherry-950/30 px-2 py-1 rounded-md border border-cherry-900/50">
                                {artwork.finished_year || 'N/A'}
                            </span>
                            {artwork.genre_name && (
                                <span className="text-slate-400 px-2 py-1 rounded-md border border-slate-800 bg-slate-950">
                                    {artwork.genre_name}
                                </span>
                            )}
                             {/* Тут можна додати тип (Digital, Oil...) якщо є в базі */}
                        </div>
                    </div>

                    {/* Опис (з прокруткою) */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar grow">
                        <div className="space-y-4 text-slate-300 leading-7 text-sm md:text-base">
                            {artwork.context_description ? (
                                <>
                                    <div className="relative pl-4 italic">
                                        <span className="absolute top-0 left-0 text-cherry-800 text-4xl leading-none font-serif -translate-y-2">“</span>
                                        <p className="whitespace-pre-wrap relative z-10 text-slate-200 font-serif text-lg">
                                            {artwork.context_description}
                                        </p>
                                    </div>
                                    {/* Якщо є обидва описи, показуємо і технічний */}
                                    {artwork.description && (
                                         <p className="whitespace-pre-wrap mt-6 pt-6 border-t border-slate-800/50 text-slate-400 text-xs">
                                            <span className="block uppercase font-bold mb-1 text-slate-600">Технічний опис:</span>
                                            {artwork.description}
                                         </p>
                                    )}
                                </>
                            ) : (
                                <p className="whitespace-pre-wrap">
                                    {artwork.description || <span className="italic opacity-50">Опис відсутній</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Нижній футер (наприклад, для тегів або кнопок в майбутньому) */}
                    <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950 shrink-0 flex justify-between items-center text-xs text-slate-500">
                        <span>ID: {artwork.id}</span>
                        <span className="uppercase tracking-wider font-bold">{artwork.status}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;