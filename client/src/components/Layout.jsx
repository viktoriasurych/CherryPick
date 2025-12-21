import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import artworkService from '../services/artworkService';
import api from '../api/axios';
import Sidebar from './Sidebar';
import { 
    Bars3Icon, XMarkIcon, MagnifyingGlassIcon, 
    UserIcon, Squares2X2Icon, QueueListIcon, SparklesIcon 
} from '@heroicons/react/24/outline';
import defaultAvatar from '../assets/default-avatar.png'; 

const Layout = ({ children }) => {
    const { logout, user } = useAuth(); // Якщо користувач не залогінений, user буде null
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recentProjects, setRecentProjects] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // СТАТ ПОШУКУ
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    // Закриття пошуку при кліку поза ним
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Пошук з Debounce (тільки якщо користувач авторизований)
    useEffect(() => {
        if (!user) return; // Гості не навантажують пошук без потреби

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

    // Відомості про останні проекти (тільки для власника)
    useEffect(() => {
        if (user) {
            artworkService.getAll({}, { by: 'updated', dir: 'DESC' })
                .then(data => setRecentProjects(data.slice(0, 10)))
                .catch(console.error);
        }
    }, [user]);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/auth');
    };

    const getCollIcon = (type) => {
        if (type === 'MOODBOARD') return <Squares2X2Icon className="w-4 h-4" />;
        if (type === 'SERIES') return <QueueListIcon className="w-4 h-4" />;
        return <SparklesIcon className="w-4 h-4 text-purple-400" />;
    };

    const userAvatar = user?.avatar_url 
        ? `http://localhost:3000${user.avatar_url}` 
        : defaultAvatar;

    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-bone-200 overflow-hidden">
            
            {/* === HEADER === */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                    
                    {/* Ліва частина: Лого + Гамбургер */}
                    <div className="flex items-center gap-4">
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

                    {/* Центр: Пошук (Тільки для авторизованих) */}
                    {user && (
                        <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 focus-within:border-cherry-700 transition-all">
                                <MagnifyingGlassIcon className="w-4 h-4 text-slate-600" />
                                <input 
                                    type="text" 
                                    placeholder="Шукайте авторів або колекції..." 
                                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                                />
                            </div>

                            {isSearchOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
                                    {/* Секції результатів (Автори / Колекції) — як ми писали раніше */}
                                    {/* ... код результатів ... */}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Права частина: Юзер або Кнопка входу */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {user ? (
                            <div className="flex items-center gap-3 sm:gap-6">
                                <Link to="/profile" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Art Profile</p>
                                        <p className="text-sm text-bone-100 font-bold">{user.nickname}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full border border-slate-700 overflow-hidden shadow-lg group-hover:border-cherry-500 transition-colors">
                                        <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-500 transition">
                                    Вийти
                                </button>
                            </div>
                        ) : (
                            <Link 
                                to="/auth" 
                                className="bg-cherry-600 hover:bg-cherry-700 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition"
                            >
                                Увійти
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* === ТІЛО САЙТУ === */}
            <div className="flex flex-1 relative overflow-hidden">
                {/* Сайдбар показуємо тільки якщо є користувач */}
                {user && (
                    <Sidebar 
                        recentProjects={recentProjects} 
                        isOpen={isSidebarOpen} 
                        onClose={() => setIsSidebarOpen(false)} 
                    />
                )}
                
                {/* Оверлей для мобільного сайдбару */}
                {user && isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity" 
                        onClick={() => setIsSidebarOpen(false)} 
                    />
                )}

                <main className={`flex-1 bg-vampire-950 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800`}>
                    <div className={`max-w-[1300px] mx-auto p-4 md:p-8 ${!user ? 'pt-12' : ''}`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;