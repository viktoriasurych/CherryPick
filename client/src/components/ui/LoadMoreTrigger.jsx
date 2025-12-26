import { ChevronDownIcon } from '@heroicons/react/24/outline';

const LoadMoreTrigger = ({ 
    hasMore, 
    onLoadMore, 
    isLoading,
    totalLoaded, 
    totalItems 
}) => {
    
    // Стан: Більше нічого вантажити
    if (!hasMore) {
        if (totalItems > 0) {
            return (
                <div className="flex items-center justify-center gap-4 py-10 opacity-40 animate-in fade-in duration-700">
                    <div className="h-px w-8 bg-muted"></div>
                    <span className="text-[10px] text-muted uppercase tracking-[0.3em] font-mono whitespace-nowrap">
                        Archive Complete ({totalItems})
                    </span>
                    <div className="h-px w-8 bg-muted"></div>
                </div>
            );
        }
        return null;
    }

    // Стан: Кнопка завантаження
    return (
        <div className="text-center pt-8 pb-12 animate-in fade-in slide-in-from-bottom-2">
            <button 
                onClick={onLoadMore}
                disabled={isLoading}
                className="group flex flex-col items-center gap-3 mx-auto transition-all disabled:opacity-30"
            >
                {/* Текст кнопки */}
                <span className="text-[10px] font-bold text-muted group-hover:text-blood uppercase tracking-[0.2em] transition-colors duration-300">
                    {isLoading ? 'Summoning...' : 'Reveal More'}
                </span>
                
                {/* Іконка (без кола, просто стрілка) */}
                <ChevronDownIcon 
                    className="w-5 h-5 text-muted group-hover:text-blood transition-transform duration-500 group-hover:translate-y-1.5" 
                />

                {/* Лічильник */}
                <span className="text-[9px] text-muted/40 font-mono tracking-widest mt-1 group-hover:text-muted transition-colors">
                    [{totalLoaded} / {totalItems}]
                </span>
            </button>
        </div>
    );
};

export default LoadMoreTrigger;