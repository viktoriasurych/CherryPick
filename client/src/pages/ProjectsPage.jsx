import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ConfirmModal from '../components/ConfirmModal';
import FilterSidebar from '../components/FilterSidebar'; // <--- Імпорт

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // 👇 СТАНИ ФІЛЬТРІВ
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: [],
        genre_ids: [],
        style_ids: [],
        material_ids: [], // <--- Додали
        tag_ids: [],      // <--- Додали
        yearFrom: '',
        yearTo: ''
    });

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // 👇 ФУНКЦІЯ ЗАВАНТАЖЕННЯ (Передаємо фільтри)
    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await artworkService.getAll(filters);
            setProjects(data);
        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    // Грузимо перший раз
    useEffect(() => {
        loadProjects();
    }, []);

    // 👇 ХЕНДЛЕРИ ДЛЯ САЙДБАРУ
    const handleApplyFilters = () => {
        loadProjects(); // Робимо запит з поточними фільтрами
        // На мобільному закриваємо панель, щоб побачити результат
        if (window.innerWidth < 768) setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        const empty = { status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], yearFrom: '', yearTo: '' };
        setFilters(empty);
        artworkService.getAll(empty).then(data => setProjects(data));
    };

    // Рахуємо кількість активних фільтрів (для красивої циферки на кнопці)
    const activeFiltersCount = 
        filters.status.length + 
        filters.genre_ids.length + 
        filters.style_ids.length + 
        filters.material_ids.length + // <---
        filters.tag_ids.length +      // <---
        (filters.yearFrom ? 1 : 0) + (filters.yearTo ? 1 : 0);

    // ... delete logic ...
    const handleRequestDelete = (id) => { setProjectToDelete(id); setDeleteModalOpen(true); };
    const confirmDelete = async () => { if (!projectToDelete) return; try { await artworkService.delete(projectToDelete); setDeleteModalOpen(false); setProjectToDelete(null); loadProjects(); } catch (error) { alert('Не вдалося видалити'); } };

    return (
        <div className="relative min-h-screen flex overflow-x-hidden">
            
            {/* 👇 ОСНОВНИЙ КОНТЕНТ: Зсувається (mr-80) на десктопі, коли фільтр відкритий */}
            <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isFilterOpen ? 'mr-0 md:mr-80' : ''}`}>
                <div className="max-w-6xl mx-auto">
                    
                    {/* Хедер */}
                    <div className="flex justify-between items-center mb-8 border-b border-cherry-900 pb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-cherry-500">Архів Робіт</h1>
                        
                        <div className="flex gap-2 md:gap-4">
                            {/* Кнопка ВІДКРИТИ ФІЛЬТР */}
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded transition border select-none text-sm md:text-base
                                    ${isFilterOpen || activeFiltersCount > 0 
                                        ? 'bg-slate-800 border-cherry-500 text-cherry-400' 
                                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}
                                `}
                            >
                                <span className="text-lg">🌪</span>
                                <span className="hidden md:inline">Фільтр</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-cherry-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold ml-1">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Кнопка ДОДАТИ */}
                            <Link 
                                to="/projects/new" 
                                className="bg-cherry-700 hover:bg-cherry-800 text-white px-3 py-2 rounded transition shadow-lg shadow-cherry-900/20 flex items-center gap-2 text-sm md:text-base"
                            >
                                <span>+</span> <span className="hidden md:inline">Додати</span>
                            </Link>
                        </div>
                    </div>

                    {/* СІТКА ПРОЄКТІВ */}
                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Завантаження архіву...</div>
                    ) : (
                        <>
                            {projects.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                                    <p className="text-slate-500 text-xl mb-4">Нічого не знайдено 🕵️‍♀️</p>
                                    <button onClick={handleResetFilters} className="text-cherry-500 hover:underline">
                                        Скинути фільтри
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map(art => (
                                        <Link 
                                            to={`/projects/${art.id}`} 
                                            key={art.id} 
                                            className="block bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-cherry-600 transition shadow-lg relative group"
                                        >
                                            <div className="h-48 bg-black relative">
                                                {art.image_path ? (
                                                    <img 
                                                        src={artworkService.getImageUrl(art.image_path)} 
                                                        alt={art.title} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                                )}
                                                
                                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-slate-700">
                                                    {art.status}
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="text-xl font-bold text-cherry-400 truncate">{art.title}</h3>
                                                
                                                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                    <span>{art.genre_name || 'Без жанру'}</span>
                                                    <span>•</span>
                                                    {/* Пріоритет: показуємо рік завершення, якщо є */}
                                                    <span>
                                                        {art.finished_year 
                                                            ? `Заверш: ${art.finished_year}` 
                                                            : (art.started_year || new Date(art.created_date).getFullYear())
                                                        }
                                                    </span>
                                                </div>

                                                <button 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        handleRequestDelete(art.id); 
                                                    }} 
                                                    className="mt-4 text-xs text-red-500 hover:underline relative z-10"
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 👇 САЙДБАР (Рендериться завжди, ховається через CSS translate) */}
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