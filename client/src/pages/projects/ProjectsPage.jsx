import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    AdjustmentsHorizontalIcon, 
    PlusIcon, 
    ArrowPathIcon 
} from '@heroicons/react/24/outline';

import artworkService from '../../services/artworkService';
import FilterSidebar from '../components/FilterSidebar';
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Порожній стан фільтрів для скидання
    const emptyFilters = { 
        status: [], 
        genre_ids: [], 
        style_ids: [], 
        material_ids: [], 
        tag_ids: [], 
        yearFrom: '', 
        yearTo: '' 
    };

    const [filters, setFilters] = useState(emptyFilters);
    const [sortConfig, setSortConfig] = useState({ by: 'updated', dir: 'DESC' });

    // Хуки для навігації
    const location = useLocation();
    const navigate = useNavigate();

    // --- DATA LOADING ---

    // Функція завантаження (приймає фільтри як аргумент, щоб не чекати оновлення стейту)
    const loadProjects = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const data = await artworkService.getAll(currentFilters, sortConfig);
            setProjects(data);
        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Ефект для обробки переходу з іншої сторінки (клік по тегу)
    useEffect(() => {
        if (location.state && location.state.applyFilter) {
            // Якщо передали фільтр (наприклад, { genre_ids: [5] })
            const newFilters = { ...emptyFilters, ...location.state.applyFilter };
            
            // 1. Оновлюємо стейт
            setFilters(newFilters);
            setIsFilterOpen(true); // Відкриваємо сайдбар, щоб юзер бачив, що фільтр активний
            
            // 2. Очищаємо історію, щоб при F5 не було глюків
            navigate(location.pathname, { replace: true, state: {} });
            
            // 3. Завантажуємо дані з НОВИМИ фільтрами
            loadProjects(newFilters);
        } else {
            // Звичайне завантаження
            loadProjects(filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, sortConfig]); // Перезавантажуємо при зміні сортування або вхідних даних

    // --- HANDLERS ---

    const handleSortChange = (e) => setSortConfig(p => ({ ...p, by: e.target.value }));
    const toggleSortDir = () => setSortConfig(p => ({ ...p, dir: p.dir === 'ASC' ? 'DESC' : 'ASC' }));

    const handleApplyFilters = () => { 
        loadProjects(filters); 
        // На мобільному закриваємо сайдбар після застосування
        if (window.innerWidth < 768) setIsFilterOpen(false); 
    };

    const handleResetFilters = () => {
        setFilters(emptyFilters);
        loadProjects(emptyFilters);
    };

    // Лічильник активних фільтрів для бейджика
    const activeFiltersCount = 
        filters.status.length + 
        filters.genre_ids.length + 
        filters.style_ids.length + 
        filters.material_ids.length + 
        filters.tag_ids.length + 
        (filters.yearFrom ? 1 : 0) + 
        (filters.yearTo ? 1 : 0);

    // --- RENDER ---

    return (
        <div className="relative min-h-screen flex overflow-x-hidden pb-20">
            
            {/* Основний контент */}
            <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isFilterOpen ? 'mr-0 md:mr-80' : ''}`}>
                <div className="max-w-[1920px] mx-auto">
                    
                    {/* Хедер */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-cherry-900/30 pb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Архів Робіт</h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
                                {projects.length} {projects.length === 1 ? 'проєкт' : projects.length > 1 && projects.length < 5 ? 'проєкти' : 'проєктів'}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                            
                            {/* Сортування */}
                            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 mr-auto md:mr-0 shadow-sm">
                                <select 
                                    value={sortConfig.by}
                                    onChange={handleSortChange}
                                    className="bg-transparent text-slate-300 text-sm px-2 py-1 outline-none cursor-pointer hover:text-white appearance-none font-bold"
                                >
                                    <option value="updated" className="bg-slate-950">🕒 Останні зміни</option>
                                    <option value="created" className="bg-slate-950">📅 Дата створення</option>
                                    <option value="title" className="bg-slate-950">🔤 Назва (А-Я)</option>
                                    <option value="status" className="bg-slate-950">📌 Статус</option>
                                </select>
                                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                                <button onClick={toggleSortDir} className="px-2 py-1 text-slate-400 hover:text-cherry-400 transition" title="Змінити напрямок">
                                    {sortConfig.dir === 'ASC' ? '⬆' : '⬇'}
                                </button>
                            </div>

                            {/* Кнопка Фільтр */}
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border select-none text-sm font-bold shadow-sm ${isFilterOpen || activeFiltersCount > 0 ? 'bg-slate-800 border-cherry-500 text-cherry-400 shadow-cherry-900/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Фільтр</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-cherry-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 min-w-[20px] text-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Кнопка Новий */}
                            <Link to="/projects/new" className="bg-cherry-700 hover:bg-cherry-600 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-cherry-900/40 flex items-center gap-2 text-sm font-bold active:scale-95 border border-cherry-500">
                                <PlusIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Новий</span>
                            </Link>
                        </div>
                    </div>

                    {/* СІТКА ПРОЄКТІВ */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                            <ArrowPathIcon className="w-8 h-8 animate-spin" />
                            <span className="animate-pulse">Завантаження архіву...</span>
                        </div>
                    ) : (
                        <>
                            {projects.length === 0 ? (
                                <div className="text-center py-24 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 flex flex-col items-center gap-4">
                                    <div className="text-4xl">🕵️‍♀️</div>
                                    <div>
                                        <p className="text-slate-400 text-lg font-bold">Нічого не знайдено</p>
                                        <p className="text-slate-600 text-sm">Спробуйте змінити параметри фільтрації</p>
                                    </div>
                                    <button 
                                        onClick={handleResetFilters} 
                                        className="text-cherry-400 hover:text-cherry-300 font-bold text-sm border-b border-dashed border-cherry-500/50 hover:border-cherry-400 pb-0.5 transition"
                                    >
                                        Скинути всі фільтри
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                                    {projects.map(art => (
                                        <ProjectCard 
                                            key={art.id} 
                                            project={art} 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Сайдбар фільтрів */}
            <FilterSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
        </div>
    );
};

export default ProjectsPage;