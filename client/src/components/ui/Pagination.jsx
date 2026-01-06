import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Pagination = ({ 
    totalItems, 
    itemsPerPage, 
    currentPage, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const siblingCount = 1;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - siblingCount);
            let end = Math.min(totalPages - 1, currentPage + siblingCount);

            if (start > 2) pages.push('...');

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-12 md:mt-16 animate-in fade-in slide-in-from-bottom-6 duration-700 font-mono px-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-sm border border-border bg-ash/20 text-muted hover:text-blood hover:border-blood disabled:opacity-10 disabled:pointer-events-none transition-all duration-300"
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
                {pages.map((number, index) => (
                    number === '...' ? (
                        <span key={`dots-${index}`} className="px-1 text-muted text-xs tracking-widest">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => onPageChange(number)}
                            className={`
                                w-8 h-8 sm:w-9 sm:h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border
                                ${currentPage === number 
                                    ? 'bg-blood text-white border-blood shadow-[0_0_15px_rgba(159,18,57,0.4)] scale-110 z-10' 
                                    : 'bg-void text-muted border-border hover:border-muted hover:text-bone'}
                            `}
                        >
                            {String(number).padStart(2, '0')}
                        </button>
                    )
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-sm border border-border bg-ash/20 text-muted hover:text-blood hover:border-blood disabled:opacity-10 disabled:pointer-events-none transition-all duration-300"
                aria-label="Next page"
            >
                <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;