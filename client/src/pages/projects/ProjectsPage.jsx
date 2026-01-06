import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    AdjustmentsHorizontalIcon, 
    PlusIcon, 
    MagnifyingGlassIcon,
    XMarkIcon 
} from '@heroicons/react/24/outline';

import artworkService from '../../services/artworkService';
import FilterSidebar from '../../components/layouts/FilterSidebar';
import ProjectCard from '../../components/projects/ProjectCard';
import SortDropdown from '../../components/ui/SortDropdown';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader'; 
import PageTitle from '../../components/shared/PageTitle'; 

const EMPTY_FILTERS = { 
    status: [], genre_ids: [], style_ids: [], material_ids: [], tag_ids: [], 
    yearFrom: '', yearTo: '' 
};

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 11;

    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [sortConfig, setSortConfig] = useState({ by: 'created', dir: 'DESC' });

    const location = useLocation();
    const navigate = useNavigate();
    
    const abortControllerRef = useRef(null);

    const loadProjects = useCallback(async (currentFilters, query, sort) => {

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            
            const data = await artworkService.getAll(
                { ...currentFilters, search: query }, 
                sort,
                { signal: abortControllerRef.current.signal } 
            );
            
            setProjects(data);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                console.error("Load error:", error);
            }
        } finally {
            if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProjects(filters, searchQuery, sortConfig);
        }, 400); 

        return () => {
            clearTimeout(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [filters, searchQuery, sortConfig, loadProjects]); 

    useEffect(() => {
        if (location.state?.applyFilter) {
            setFilters({ ...EMPTY_FILTERS, ...location.state.applyFilter });
            setIsFilterOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleSortChange = (val) => setSortConfig(p => ({ ...p, by: val }));
    const toggleSortDir = () => setSortConfig(p => ({ ...p, dir: p.dir === 'ASC' ? 'DESC' : 'ASC' }));

    const handleApplyFilters = () => { 
        loadProjects(filters, searchQuery, sortConfig); 
        if (window.innerWidth < 768) setIsFilterOpen(false); 
    };

    const handleResetFilters = () => {
        setFilters(EMPTY_FILTERS);
        setSearchQuery('');
        setCurrentPage(1);
        if (location.search) navigate('/projects'); 
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

    const activeFiltersCount = 
        filters.status.length + filters.genre_ids.length + filters.style_ids.length + 
        filters.material_ids.length + filters.tag_ids.length + 
        (filters.yearFrom ? 1 : 0) + (filters.yearTo ? 1 : 0);

    const hasActiveFilters = activeFiltersCount > 0 || searchQuery.length > 0;

    const sortOptions = [
        { value: 'updated', label: 'Latest Updates' },
        { value: 'created', label: 'Creation Date' },
        { value: 'title', label: 'Title' },
        { value: 'status', label: 'Status' }
    ];

    return (
        <div className="relative min-h-screen flex overflow-x-hidden pb-20 font-mono">
            <PageTitle title="Archive" />
            
            <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isFilterOpen ? 'mr-0 md:mr-80' : ''}`}>
                <div className="max-w-7xl mx-auto"> 
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-border/50 pb-6 gap-6">
                        <div className="flex flex-col gap-4 w-full md:max-w-xl">
                            <div>
                                <h1 className="text-4xl font-bold text-blood font-gothic tracking-wide">Archives</h1>
                                <p className="text-[10px] text-muted mt-2 uppercase tracking-[0.2em] font-bold">
                                    {loading ? 'Scanning...' : `${projects.length} Projects Found`}
                                </p>
                            </div>

                            <div className="relative group w-full">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-blood transition-colors" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1); 
                                    }}
                                    placeholder="Search by title..."
                                    className="w-full bg-void border border-border rounded-sm py-2 pl-10 pr-4 text-xs text-bone outline-none focus:border-blood focus:shadow-[0_0_15px_rgba(159,18,57,0.1)] transition-all h-10 placeholder-muted/40"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto h-10 shrink-0">
                            <SortDropdown 
                                value={sortConfig.by} 
                                direction={sortConfig.dir} 
                                onChange={handleSortChange} 
                                onToggleDirection={toggleSortDir}
                                options={sortOptions} 
                            />

                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                                className={`
                                    h-full flex items-center gap-2 px-5 rounded-sm border transition-all select-none text-xs uppercase tracking-wider font-bold
                                    ${isFilterOpen || activeFiltersCount > 0 
                                        ? 'bg-ash border-blood text-blood shadow-[0_0_10px_rgba(159,18,57,0.2)]' 
                                        : 'bg-void border-border text-muted hover:border-muted hover:text-bone'}
                                `}
                            >
                                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Filter</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-blood text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold ml-1 min-w-4.5 text-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {loading && projects.length === 0 ? (
                        <Loader text="Summoning archives..." />
                    ) : (
                        <>
                            {projects.length === 0 && hasActiveFilters && (
                                <EmptyState 
                                    title="Silence..."
                                    message="No projects match your query. Try adjusting your filters."
                                    actionLabel="Clear Search & Filters"
                                    onAction={handleResetFilters}
                                    icon={XMarkIcon}
                                />
                            )}

                             {projects.length === 0 && !hasActiveFilters && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 items-stretch">
                                    <Link 
                                        to="/projects/new" 
                                        className="
                                            group relative w-full
                                            h-auto py-3 flex flex-row
                                            sm:h-auto sm:aspect-3/4 sm:flex-col sm:py-0
                                            items-center justify-center gap-4 sm:gap-6
                                            bg-void/50 border border-dashed border-border 
                                            hover:border-blood hover:bg-void
                                            rounded-sm transition-all duration-500 cursor-pointer
                                            sm:min-h-50
                                        "
                                    >
                                        <PlusIcon className="w-5 h-5 sm:w-12 sm:h-12 text-muted/30 stroke-1 group-hover:text-blood group-hover:scale-110 transition-all duration-500" />
                                        <span className="text-[10px] font-gothic text-muted group-hover:text-bone uppercase tracking-[0.2em] transition-colors">
                                            New Project
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {projects.length > 0 && (
                                <>
                                    <div 
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 items-stretch"
                                        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 300px' }}
                                    > 
                                        <Link 
                                            to="/projects/new" 
                                            className="
                                                group relative w-full
                                                h-auto py-3 flex flex-row
                                                sm:h-auto sm:aspect-3/4 sm:flex-col sm:py-0
                                                items-center justify-center gap-4 sm:gap-6
                                                bg-void/50 border border-dashed border-border 
                                                hover:border-blood hover:bg-void
                                                rounded-sm transition-all duration-500 cursor-pointer
                                                sm:min-h-50
                                            "
                                        >
                                            <PlusIcon className="w-5 h-5 sm:w-12 sm:h-12 text-muted/30 stroke-1 group-hover:text-blood group-hover:scale-110 transition-all duration-500" />
                                            <span className="text-[10px] font-gothic text-muted group-hover:text-bone uppercase tracking-[0.2em] transition-colors">
                                                New Project
                                            </span>
                                        </Link>

                                        {currentProjects.map(project => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>

                                    {projects.length > ITEMS_PER_PAGE && (
                                        <Pagination 
                                            totalItems={projects.length}
                                            itemsPerPage={ITEMS_PER_PAGE}
                                            currentPage={currentPage}
                                            onPageChange={(page) => {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    )}
                                </>
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
        </div>
    );
};

export default ProjectsPage;