import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import FilterSidebar from '../components/FilterSidebar';
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], yearFrom: '', yearTo: ''
    });
    const [sortConfig, setSortConfig] = useState({ by: 'updated', dir: 'DESC' });

    // ❌ Прибрали стани для модалки (isDeleteModalOpen, projectToDelete)

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await artworkService.getAll(filters, sortConfig);
            setProjects(data);
        } catch (error) {
            console.error("Помилка:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProjects(); }, [sortConfig]); 

    const handleSortChange = (f) => setSortConfig(p => ({ ...p, by: f }));
    const toggleSortDir = () => setSortConfig(p => ({ ...p, dir: p.dir === 'ASC' ? 'DESC' : 'ASC' }));
    const handleApplyFilters = () => { loadProjects(); if (window.innerWidth < 768) setIsFilterOpen(false); };
    const handleResetFilters = () => {
        const empty = { status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], yearFrom: '', yearTo: '' };
        setFilters(empty);
        artworkService.getAll(empty, sortConfig).then(data => setProjects(data));
    };
    const activeFiltersCount = filters.status.length + filters.genre_ids.length + filters.style_ids.length + filters.material_ids.length + filters.tag_ids.length + (filters.yearFrom ? 1 : 0) + (filters.yearTo ? 1 : 0);

    // ❌ Прибрали функції видалення (handleRequestDelete, confirmDelete)

    return (
        <div className="relative min-h-screen flex overflow-x-hidden">
            
            <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isFilterOpen ? 'mr-0 md:mr-80' : ''}`}>
                <div className="max-w-[1920px] mx-auto">
                    
                    {/* Хедер */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-cherry-900/50 pb-6 gap-4">
                        <h1 className="text-3xl font-bold text-cherry-500 font-pixel tracking-wide">Архів Робіт</h1>
                        
                        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
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
                                <button onClick={toggleSortDir} className="px-2 py-1 text-slate-400 hover:text-cherry-400 border-l border-slate-700 transition">
                                    {sortConfig.dir === 'ASC' ? '⬆' : '⬇'}
                                </button>
                            </div>

                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border select-none text-sm font-bold shadow-sm ${isFilterOpen || activeFiltersCount > 0 ? 'bg-slate-800 border-cherry-500 text-cherry-400 shadow-cherry-900/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                <span>🌪 Фільтр</span>
                                {activeFiltersCount > 0 && <span className="bg-cherry-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">{activeFiltersCount}</span>}
                            </button>

                            <Link to="/projects/new" className="bg-cherry-700 hover:bg-cherry-600 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-cherry-900/40 flex items-center gap-2 text-sm font-bold active:scale-95">
                                <span>+</span> <span className="hidden sm:inline">Новий</span>
                            </Link>
                        </div>
                    </div>

                    {/* СІТКА */}
                    {loading ? (
                        <div className="text-center text-slate-500 py-20 animate-pulse">Завантаження...</div>
                    ) : (
                        <>
                            {projects.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg bg-slate-900/20">
                                    <p className="text-slate-500 text-xl mb-4">Нічого не знайдено 🕵️‍♀️</p>
                                    <button onClick={handleResetFilters} className="text-cherry-500 hover:text-cherry-400 underline decoration-dashed">Скинути фільтри</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {projects.map(art => (
                                        <ProjectCard 
                                            key={art.id} 
                                            project={art} 
                                            // ❌ onDelete більше не передаємо
                                        />
                                    ))}
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

            {/* ❌ ConfirmModal прибрали */}
        </div>
    );
};

export default ProjectsPage;