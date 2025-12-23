import { ChevronDownIcon } from '@heroicons/react/24/outline';

const LoadMoreTrigger = ({ 
    hasMore, 
    onLoadMore, 
    isLoading,
    totalLoaded, 
    totalItems 
}) => {
    
    if (!hasMore) {
        if (totalItems > 0) {
            return (
                <div className="text-center py-8 opacity-50 animate-in fade-in duration-700">
                    <div className="w-1 h-1 bg-slate-500 rounded-full mx-auto mb-2"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        — Історія повна ({totalItems}) —
                    </span>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="text-center pt-6 pb-12 animate-in fade-in slide-in-from-bottom-2">
            <button 
                onClick={onLoadMore}
                disabled={isLoading}
                className="group flex flex-col items-center gap-2 mx-auto transition-all disabled:opacity-50"
            >
                <span className="text-xs font-bold text-slate-500 group-hover:text-cherry-400 uppercase tracking-widest transition-colors">
                    {isLoading ? 'Завантаження...' : 'Показати ще'}
                </span>
                
                <div className={`
                    p-2 rounded-full border border-slate-800 bg-slate-900/50 
                    group-hover:border-cherry-500/50 group-hover:bg-cherry-900/10 
                    transition-all duration-300 group-hover:translate-y-1
                `}>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-cherry-400" />
                </div>

                <span className="text-[9px] text-slate-600 group-hover:text-slate-500 font-mono">
                    {totalLoaded} / {totalItems}
                </span>
            </button>
        </div>
    );
};

export default LoadMoreTrigger;