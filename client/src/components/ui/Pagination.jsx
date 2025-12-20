import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ 
    totalItems, 
    itemsPerPage, 
    currentPage, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Якщо сторінка всього одна (або 0), пагінацію не показуємо
    if (totalPages <= 1) return null;

    // Генеруємо масив номерів сторінок [1, 2, 3...]
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Кнопка НАЗАД */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:hover:border-slate-800 transition"
            >
                <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {/* Номери сторінок */}
            <div className="flex gap-1">
                {pages.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`
                            w-8 h-8 rounded-lg text-xs font-bold transition border
                            ${currentPage === number 
                                ? 'bg-cherry-600 text-white border-cherry-500 shadow-lg shadow-cherry-900/50 scale-110' 
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'}
                        `}
                    >
                        {number}
                    </button>
                ))}
            </div>

            {/* Кнопка ВПЕРЕД */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:hover:border-slate-800 transition"
            >
                <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;