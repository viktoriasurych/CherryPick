import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SortDropdown from '../ui/SortDropdown';

const CollectionToolbar = ({ 
    title,              // Заголовок (напр. "My Collections")
    subTitle,           // Підзаголовок (напр. "Scanning...")
    search, setSearch, 
    filterType, setFilterType, 
    sortConfig, 
    onSortChange,       // Функція зміни ключа сортування
    onToggleDir,        // Функція зміни напрямку
    sortOptions         // Масив опцій
}) => {

    const TABS = ['ALL', 'MOODBOARD', 'SERIES', 'EXHIBITION'];

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-border/50 pb-6 gap-6">
            
            {/* --- ЛІВА ЧАСТИНА: ЗАГОЛОВОК + ПОШУК --- */}
            <div className="flex flex-col gap-4 w-full md:max-w-xl">
                <div>
                    <h1 className="text-4xl font-gothic tracking-wide text-blood">{title}</h1>
                    {subTitle && (
                        <p className="text-[10px] text-muted mt-2 uppercase tracking-[0.2em] font-bold">
                            {subTitle}
                        </p>
                    )}
                </div>

                {/* SEARCH BAR */}
                <div className="relative group w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-blood transition-colors" />
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search collections..."
                        className="w-full bg-void border border-border rounded-sm py-2 pl-10 pr-8 text-xs text-bone outline-none focus:border-blood focus:shadow-[0_0_15px_rgba(159,18,57,0.1)] transition-all h-10 placeholder-muted/40"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white transition">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- ПРАВА ЧАСТИНА: ТАБИ + СОРТУВАННЯ --- */}
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto shrink-0">
                
                {/* TABS */}
                <div className="flex bg-void border border-border rounded-sm p-1 h-10 items-center overflow-x-auto max-w-full no-scrollbar">
                    {TABS.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`
                                px-4 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all h-full whitespace-nowrap
                                ${filterType === type 
                                    ? 'bg-blood text-white shadow-[0_0_10px_rgba(159,18,57,0.4)]' // Активний (Червоний)
                                    : 'text-muted hover:text-bone hover:bg-white/5'}
                            `}
                        >
                            {type === 'ALL' ? 'All' : type}
                        </button>
                    ))}
                </div>

                {/* SORT */}
                <SortDropdown 
                    value={sortConfig.key} 
                    direction={sortConfig.dir} 
                    onChange={onSortChange} 
                    onToggleDirection={onToggleDir}
                    options={sortOptions} 
                />
            </div>
        </div>
    );
};

export default CollectionToolbar;