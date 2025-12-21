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
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recentProjects, setRecentProjects] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ПОШУКОВИЙ СТАН
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    // Закриття пошуку при кліку зовні
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Ефект пошуку (Debounce)
    useEffect(() => {
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
        }, 300); // Чекаємо 300мс після останньої літери
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

    // Іконки для типів колекцій
    const getCollIcon = (type) => {
        if (type === 'MOODBOARD') return <Squares2X2Icon className="w-4 h-4" />;
        if (type === 'SERIES') return <QueueListIcon className="w-4 h-4" />;
        return <SparklesIcon className="w-4 h-4 text-purple-400" />;
    };

    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-bone-200 overflow-hidden">
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-md transition text-slate-300">
                            {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                        <Link to="/projects" className="flex items-center gap-2 group shrink-0">
                            <span className="text-2xl">🍒</span>
                            <span className="font-pixel text-lg text-cherry-500 uppercase hidden sm:inline">CherryPick</span>
                        </Link>
                    </div>

                    {/* === ГЛОБАЛЬНИЙ ПОШУК === */}
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

                        {/* ВИПАДАЮЧИЙ СПИСОК РЕЗУЛЬТАТІВ */}
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                
                                {/* СЕКЦІЯ: КОРИСТУВАЧІ */}
                                {searchResults.users.length > 0 && (
                                    <div className="p-2 border-b border-slate-800">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-2">Автори</p>
                                        {searchResults.users.map(u => (
                                            <Link 
                                                key={u.id} to={`/user/${u.id}`} 
                                                onClick={() => setIsSearchOpen(false)}
                                                className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-md transition group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0">
                                                    <img src={u.avatar_url ? `http://localhost:3000${u.avatar_url}` : defaultAvatar} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-bold group-hover:text-cherry-400 transition">{u.nickname}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* СЕКЦІЯ: КОЛЕКЦІЇ */}
                                {searchResults.collections.length > 0 && (
                                    <div className="p-2">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-2">Колекції</p>
                                        {searchResults.collections.map(c => (
                                            <Link 
                                                key={c.id} to={`/collections/${c.id}`}
                                                onClick={() => setIsSearchOpen(false)}
                                                className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-md transition group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-slate-500 group-hover:text-cherry-500 transition">{getCollIcon(c.type)}</div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold truncate group-hover:text-cherry-400 transition">{c.title}</p>
                                                        <p className="text-[10px] text-slate-500 italic">by {c.author}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 shrink-0">{c.item_count} art</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {searchResults.users.length === 0 && searchResults.collections.length === 0 && (
                                    <div className="p-6 text-center text-xs text-slate-500 italic">Нічого не знайдено... 🍒</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {user && (
                            <Link to="/profile" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                                <div className="text-right hidden md:block leading-tight">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Art Profile</p>
                                    <p className="text-sm text-bone-100 font-bold">{user.nickname || 'Митець'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full border border-slate-700 overflow-hidden shadow-lg group-hover:border-cherry-500 transition-colors">
                                    <img src={user?.avatar_url ? `http://localhost:3000${user.avatar_url}` : defaultAvatar} alt="" className="w-full h-full object-cover" />
                                </div>
                            </Link>
                        )}
                        <button onClick={() => { logout(); navigate('/auth'); }} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-500 transition">Вийти</button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                <Sidebar recentProjects={recentProjects} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
                <main className="flex-1 bg-vampire-950 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="max-w-[1300px] mx-auto p-4 md:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default Layout;