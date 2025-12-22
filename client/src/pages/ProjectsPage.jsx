import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ConfirmModal from '../components/ConfirmModal';
import FilterSidebar from '../components/FilterSidebar';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Фільтри
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], yearFrom: '', yearTo: ''
    });

    // 👇 СОРТУВАННЯ
    const [sortConfig, setSortConfig] = useState({
        by: 'updated', // За замовчуванням
        dir: 'DESC'
    });

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Завантаження
    const loadProjects = async () => {
        try {
            setLoading(true);
            // Передаємо фільтри і сортування
            const data = await artworkService.getAll(filters, sortConfig);
            setProjects(data);
        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    // Оновлюємо при зміні сортування (фільтри застосовуються кнопкою Apply)
    useEffect(() => {
        loadProjects();
    }, [sortConfig]); 

    // Handlers
    const handleSortChange = (field) => {
        setSortConfig(prev => ({ ...prev, by: field }));
    };

    const toggleSortDir = () => {
        setSortConfig(prev => ({ ...prev, dir: prev.dir === 'ASC' ? 'DESC' : 'ASC' }));
    };

    const handleApplyFilters = () => {
        loadProjects();
        if (window.innerWidth < 768) setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        const empty = { status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], yearFrom: '', yearTo: '' };
        setFilters(empty);
        // Скидаємо і одразу вантажимо
        artworkService.getAll(empty, sortConfig).then(data => setProjects(data));
    };

    const activeFiltersCount = 
        filters.status.length + filters.genre_ids.length + filters.style_ids.length + 
        filters.material_ids.length + filters.tag_ids.length + 
        (filters.yearFrom ? 1 : 0) + (filters.yearTo ? 1 : 0);

    const handleRequestDelete = (id) => { setProjectToDelete(id); setDeleteModalOpen(true); };
    const confirmDelete = async () => { if (!projectToDelete) return; try { await artworkService.delete(projectToDelete); setDeleteModalOpen(false); setProjectToDelete(null); loadProjects(); } catch (error) { alert('Не вдалося видалити'); } };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
        <div className="relative min-h-screen flex overflow-x-hidden">
            
            <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isFilterOpen ? 'mr-0 md:mr-80' : ''}`}>
                <div className="max-w-6xl mx-auto">
                    
                    {/* Хедер + Сортування */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-cherry-900/50 pb-6 gap-4">
                        <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Архів Робіт</h1>
                        
                        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                            
                            {/* 👇 ПАНЕЛЬ СОРТУВАННЯ */}
                            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 mr-auto md:mr-0 shadow-sm">
                                <select 
                                    value={sortConfig.by}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-transparent text-slate-300 text-sm px-2 py-1 outline-none cursor-pointer hover:text-white"
                                >
                                    <option value="updated" className="bg-slate-950">🕒 Останні зміни</option>
                                    <option value="created" className="bg-slate-950">📅 Дата створення</option>
                                    <option value="title" className="bg-slate-950">🔤 Назва (А-Я)</option>
                                    <option value="status" className="bg-slate-950">📌 Статус</option>
                                </select>
                                <button 
                                    onClick={toggleSortDir}
                                    className="px-2 py-1 text-slate-400 hover:text-cherry-400 border-l border-slate-700 transition"
                                    title={sortConfig.dir === 'ASC' ? 'За зростанням' : 'За спаданням'}
                                >
                                    {sortConfig.dir === 'ASC' ? '⬆' : '⬇'}
                                </button>
                            </div>

                            {/* Кнопка Фільтр */}
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg transition border select-none text-sm font-bold shadow-sm
                                    ${isFilterOpen || activeFiltersCount > 0 
                                        ? 'bg-slate-800 border-cherry-500 text-cherry-400 shadow-cherry-900/20' 
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                                `}
                            >
                                <span>🌪 Фільтр</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-cherry-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Кнопка Додати */}
                            <Link 
                                to="/projects/new" 
                                className="bg-cherry-700 hover:bg-cherry-600 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-cherry-900/40 flex items-center gap-2 text-sm font-bold active:scale-95"
                            >
                                <span>+</span> <span className="hidden sm:inline">Новий</span>
                            </Link>
                        </div>
                    </div>

                    {/* Сітка */}
                    {loading ? (
                        <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
                    ) : (
                        <>
                            {projects.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg bg-slate-900/20">
                                    <p className="text-slate-500 text-xl mb-4">Нічого не знайдено 🕵️‍♀️</p>
                                    <button onClick={handleResetFilters} className="text-cherry-500 hover:text-cherry-400 underline decoration-dashed">
                                        Скинути фільтри
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map(art => {
                                        // 👇 ЛОГІКА "ОСТАННЄ ОНОВЛЕННЯ"
                                        // Якщо статус активний ("В процесі", "Скетч", "Заплановано") -> показуємо дату сесії або створення
                                        // Якщо статус фінальний ("Завершено", "Покинуто", "На паузі") -> показуємо рік завершення
                                        
                                        const isInactive = ['FINISHED', 'DROPPED', 'ON_HOLD'].includes(art.status);
                                        const showLastUpdate = !isInactive && art.last_session_date;

                                        return (
                                            <Link 
                                                to={`/projects/${art.id}`} 
                                                key={art.id} 
                                                className="group block bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-cherry-500/50 transition duration-300 shadow-lg hover:shadow-cherry-900/20 flex flex-col h-full"
                                            >
                                                <div className="h-52 bg-black relative overflow-hidden">
                                                <img 
        src={artworkService.getImageUrl(art.image_path)} 
        alt={art.title} 
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" 
    />
                                                    
                                                    <div className={`absolute top-2 right-2 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border shadow-lg uppercase tracking-wider
                                                        ${art.status === 'FINISHED' ? 'bg-green-900/80 border-green-500 text-green-100' : 
                                                          art.status === 'DROPPED' ? 'bg-red-900/80 border-red-500 text-red-100' :
                                                          'bg-black/70 border-slate-600 text-white'}
                                                    `}>
                                                        {art.status}
                                                    </div>
                                                </div>

                                                <div className="p-5 flex flex-col grow">
                                                    <h3 className="text-xl font-bold text-bone-100 group-hover:text-cherry-400 transition truncate mb-1">{art.title}</h3>
                                                    
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate max-w-[120px]">{art.genre_name || 'Без жанру'}</span>
                                                        <span>•</span>
                                                        <span>{art.started_year || new Date(art.created_date).getFullYear()}</span>
                                                    </div>

                                                    {/* 👇 РЯДОК ДАТИ */}
                                                    <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-end">
                                                        <div className="text-xs">
                                                            {showLastUpdate ? (
                                                                <div className="text-green-400 font-mono" title="Дата останньої сесії">
                                                                    <span className="text-slate-600 mr-1">Актив:</span> 
                                                                    {formatDate(art.last_session_date)}
                                                                </div>
                                                            ) : art.finished_year ? (
                                                                <div className="text-slate-500 font-mono">
                                                                    Заверш: {art.finished_year}
                                                                </div>
                                                            ) : (
                                                                <div className="text-slate-600 font-mono">
                                                                    Створено: {formatDate(art.created_date)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); handleRequestDelete(art.id); }} 
                                                            className="text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1"
                                                            title="Видалити"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <FilterSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                onConfirm={confirmDelete} 
                title="Видалити роботу?" 
                message="Цю дію неможливо скасувати." 
            />
        </div>
    );
};

export default ProjectsPage;