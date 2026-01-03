import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Bars3Icon, XMarkIcon, MagnifyingGlassIcon, 
    UserIcon, ArrowRightOnRectangleIcon // Іконка входу
} from '@heroicons/react/24/outline';
import UserDropdown from './UserDropdown';
import api from '../../api/axios';

import catSpriteImg from '../../assets/cat-sprite.png';

const Header = ({ user, logout, isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    // Логіка пошуку (без змін)
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

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <header className="h-16 border-b border-border bg-deep shadow-lg shadow-black/50 relative z-50">
            <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                
                {/* ЛІВА ЧАСТИНА */}
                <div className="flex items-center gap-4 shrink-0">
                    {user && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-ash rounded-md transition text-muted hover:text-bone"
                        >
                            {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    )}
                    <Link to={user ? "/projects" : "/"} className="flex items-center gap-3 group shrink-0">
                        <span className="font-gothic text-2xl font-bold text-blood tracking-widest uppercase hidden sm:inline group-hover:text-blood-hover transition-colors">
                            CherryPick
                        </span>
                        
                        {/* Кіт-спрайт */}
                        <div className="w-8 h-8 overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
                            <img src={catSpriteImg} alt="Cat" className="max-w-none h-full absolute top-0 left-0 animate-sprite-run" />
                        </div>
                    </Link>
                </div>

                {/* ПРАВА ЧАСТИНА */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    
                    {/* ПОШУК (Тільки для авторизованих) */}
                    {user && (
                        <div className="relative w-full max-w-xs md:max-w-sm" ref={searchRef}>
                            <div className="flex items-center bg-ash border border-border rounded-md px-3 py-1.5 focus-within:border-blood transition-all w-full">
                                <MagnifyingGlassIcon className="w-4 h-4 text-muted shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-bone placeholder-muted/50 font-mono min-w-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                                />
                            </div>

                            {/* Випадайка пошуку */}
                            {isSearchOpen && (
                                <div className="absolute top-full right-0 w-full mt-2 bg-ash border border-border rounded-lg shadow-2xl shadow-black overflow-hidden z-[100] max-h-[400px] overflow-y-auto custom-scrollbar">
                                     {searchResults.users.map(u => (
                                        <Link key={u.id} to={`/user/${u.nickname}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-3 p-2 hover:bg-charcoal rounded-md transition group">
                                            <span className="text-sm font-medium text-bone group-hover:text-blood transition font-mono">{u.nickname}</span>
                                        </Link>
                                     ))}
                                     {/* (Тут решта коду для колекцій, як було раніше...) */}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ЮЗЕР або КНОПКА ВХОДУ */}
                    <div className="shrink-0">
                        {user ? (
                            <UserDropdown user={user} onLogout={handleLogout} />
                        ) : (
                            // 👇 ОНОВЛЕНА КНОПКА SIGN IN
                            <Link 
                                to="/auth" 
                                className="
                                    group flex items-center gap-2
                                    px-6 py-2 
                                    text-xs font-bold font-mono uppercase tracking-widest
                                    
                                    /* СТАН СПОКОЮ: Прозорий фон, червона рамка, червоний текст */
                                    bg-transparent 
                                    border border-blood 
                                    text-blood
                                    
                                    /* СТАН НАВЕДЕННЯ: Червоний фон, білий текст */
                                    hover:bg-blood 
                                    hover:text-white 
                                    
                                    rounded-sm transition-all duration-300
                                "
                            >
                                <span>Sign In</span>
                                <ArrowRightOnRectangleIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;