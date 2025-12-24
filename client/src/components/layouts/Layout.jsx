import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import artworkService from '../../services/artworkService';
import collectionService from '../../services/collectionService';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import UserDropdown from './UserDropdown';
import { 
    Bars3Icon, 
    XMarkIcon, // 👈 ДОДАВ ЦЕЙ ІМПОРТ
    MagnifyingGlassIcon, 
    UserIcon, 
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon 
} from '@heroicons/react/24/outline';
import defaultAvatarImg from '../assets/default-avatar.png';

// Імпортуємо наш новий хук
import { useCreateCollection } from '../../hooks/useCreateCollection';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentCollections, setRecentCollections] = useState([]); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Функція оновлення даних для Сайдбару
    const refreshSidebarData = () => {
        if (user) {
            Promise.all([
                artworkService.getAll({}, { by: 'updated', dir: 'DESC' }),
                collectionService.getAll()
            ]).then(([projects, collections]) => {
                setRecentProjects(projects);
                setRecentCollections(collections);
            }).catch(console.error);
        }
    };

    // Ініціалізуємо хук
    const { openModal: openCreateCollection, CreateModal } = useCreateCollection(refreshSidebarData);

    // СТАТ ПОШУКУ
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) return;
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const res = await api.get(`/search?q=${searchQuery}`);
                    setSearchResults(res.data);
                    setIsSearchOpen(true);
                } catch (e) { console.error(e); }
            } else {
                setSearchResults({ users: [], collections: [] });
                setIsSearchOpen(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, user]);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        refreshSidebarData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const getCollIcon = (type) => {
        if (type === 'MOODBOARD') return <Squares2X2Icon className="w-4 h-4" />;
        if (type === 'SERIES') return <QueueListIcon className="w-4 h-4" />;
        return <SparklesIcon className="w-4 h-4 text-purple-400" />;
    };

    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-bone-200 overflow-hidden">
            
            {/* === HEADER === */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4 shrink-0">
                        {user && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-slate-800 rounded-md transition text-slate-300"
                            >
                                {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                            </button>
                        )}
                        <Link to={user ? "/projects" : "/"} className="flex items-center gap-2 group shrink-0">
                            <span className="text-2xl">🍒</span>
                            <span className="font-pixel text-lg text-cherry-500 group-hover:text-cherry-400 transition uppercase hidden sm:inline">
                                CherryPick
                            </span>
                        </Link>
                    </div>

                    {/* Пошук */}
                    {user && (
                        <div className="relative flex-1 max-w-md mx-2" ref={searchRef}>
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 focus-within:border-cherry-700 transition-all w-full">
                                <MagnifyingGlassIcon className="w-4 h-4 text-slate-600 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Шукайте авторів або колекції..."
                                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-300 min-w-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                                />
                            </div>

                            {isSearchOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-[100] max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {searchResults.users.length > 0 && (
                                        <div className="p-2 border-b border-slate-800/50">
                                            <header className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                                                <span>Автори</span>
                                                <UserIcon className="w-3 h-3" />
                                            </header>
                                            {searchResults.users.map(u => (
                                                <Link
                                                    key={u.id} to={`/user/${u.nickname}`}
                                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition group"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                                                        <img src={u.avatar_url ? `http://localhost:3000${u.avatar_url}` : defaultAvatarImg} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-200 group-hover:text-cherry-400 transition">{u.nickname}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.collections.length > 0 && (
                                        <div className="p-2">
                                            <header className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                                                <span>Колекції</span>
                                                <Squares2X2Icon className="w-3 h-3" />
                                            </header>
                                            {searchResults.collections.map(c => (
                                                <Link
                                                    key={c.id} to={`/collections/${c.id}`}
                                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                                    className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md transition group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-1.5 bg-slate-800 rounded text-slate-500 group-hover:text-cherry-500 transition shrink-0">
                                                            {getCollIcon(c.type)}
                                                        </div>
                                                        <div className="min-w-0 leading-tight">
                                                            <p className="text-sm font-bold text-slate-200 truncate group-hover:text-cherry-400 transition">{c.title}</p>
                                                            <p className="text-[10px] text-slate-500 truncate">автор: <span className="text-slate-400">{c.author}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[9px] font-mono text-slate-600 bg-black/40 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 ml-2">
                                                        {c.item_count} items
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.users.length === 0 && searchResults.collections.length === 0 && (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-slate-500">За запитом <span className="text-slate-300 italic">"{searchQuery}"</span> нічого не знайдено 🍒</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {user ? (
                            <UserDropdown user={user} onLogout={handleLogout} />
                        ) : (
                            <Link to="/auth" className="bg-cherry-600 hover:bg-cherry-700 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition">
                                Увійти
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* === ТІЛО === */}
            <div className="flex flex-1 relative overflow-hidden">
                
                {user && (
                    <Sidebar
                        recentProjects={recentProjects}
                        recentCollections={recentCollections}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        onOpenCollectionModal={openCreateCollection}
                    />
                )}
                
                {user && isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className={`
                    flex-1 bg-vampire-950 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800
                    transition-all duration-300
                    ${isSidebarOpen ? 'blur-sm pointer-events-none lg:blur-0 lg:pointer-events-auto' : ''}
                `}>
                    <div className={`max-w-[1300px] mx-auto p-4 md:p-8 ${!user ? 'pt-12' : ''}`}>
                        {children}
                    </div>
                </main>
            </div>

            <CreateModal />
        </div>
    );
};

export default Layout;