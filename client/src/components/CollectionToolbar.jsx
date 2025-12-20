import { 
    MagnifyingGlassIcon, 
    BarsArrowDownIcon, 
    BarsArrowUpIcon 
} from '@heroicons/react/24/outline';
import Tabs from './ui/Tabs'; // 👈 Імпортуємо наш новий компонент

const TABS = [
    { id: 'ALL', label: 'Усі' },
    { id: 'MOODBOARD', label: 'Мудборди' },
    { id: 'SERIES', label: 'Серії' },
    { id: 'EXHIBITION', label: 'Виставки' }
];

const CollectionToolbar = ({ 
    search, setSearch, 
    filter, setFilter, 
    sortConfig, setSortConfig 
}) => {

    const toggleSortDir = () => {
        setSortConfig(prev => ({...prev, dir: prev.dir === 'ASC' ? 'DESC' : 'ASC'}));
    };

    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* 1. ВИКОРИСТОВУЄМО НОВИЙ КОМПОНЕНТ TABS */}
            <div className="w-full md:w-auto">
                <Tabs 
                    items={TABS} 
                    activeId={filter} 
                    onChange={setFilter} 
                />
            </div>

            {/* Права частина (Пошук + Сортування) залишається без змін */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative group grow md:grow-0">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-cherry-500 transition" />
                    <input 
                        type="text" 
                        placeholder="Пошук..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-48 bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 focus:border-cherry-900 focus:outline-none transition"
                    />
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 shrink-0">
                    <select 
                        value={sortConfig.key}
                        onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value }))}
                        className="bg-transparent text-slate-400 text-xs sm:text-sm px-2 py-1 outline-none cursor-pointer hover:text-white appearance-none font-medium text-center"
                    >
                        <option value="created_at" className="bg-slate-950">📅 Дата</option>
                        <option value="title" className="bg-slate-950">🔤 Назва</option>
                        <option value="item_count" className="bg-slate-950">🖼 Кількість</option>
                    </select>
                    <button 
                        onClick={toggleSortDir}
                        className="px-2 py-1 text-slate-500 hover:text-cherry-500 border-l border-slate-800 transition"
                    >
                        {sortConfig.dir === 'ASC' ? <BarsArrowUpIcon className="w-4 h-4" /> : <BarsArrowDownIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionToolbar;