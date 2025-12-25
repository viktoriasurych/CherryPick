// client/src/components/layouts/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserIcon, Squares2X2Icon, QueueListIcon, SparklesIcon } from '@heroicons/react/24/outline';
import UserDropdown from './UserDropdown';
import api from '../../api/axios';

// Імпорт картинок (перевір шляхи, якщо не працює)
import defaultAvatarImg from '../../assets/default-avatar.png';
import catSpriteImg from '../../assets/cat-sprite.png';

const Header = ({ user, logout, isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    // Логіка пошуку (та сама, що була в Layout)
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

    const getCollIcon = (type) => {
        if (type === 'MOODBOARD') return <Squares2X2Icon className="w-4 h-4" />;
        if (type === 'SERIES') return <QueueListIcon className="w-4 h-4" />;
        return <SparklesIcon className="w-4 h-4 text-blood" />;
    };

    return (
        // 👇 Більше не sticky
        <header className="h-16 border-b border-border bg-deep shadow-lg shadow-black/50 relative z-50">
            <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                
                {/* ЛІВА ЧАСТИНА: МЕНЮ + ЛОГО */}
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
                        

                        {/* 👇 НАЗВА: ЗАВЖДИ ЧЕРВОНА (text-blood), БЕЗ ХОВЕРУ */}
                        <span className="font-gothic text-2xl font-bold text-blood-hover tracking-widest uppercase hidden sm:inline">
                            CherryPick
                        </span>

                         {/* АНІМОВАНИЙ КІТ */}
                         <div className="w-8 h-8 overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
                            <img src={catSpriteImg} alt="Cat" className="max-w-none h-full absolute top-0 left-0 animate-sprite-run" />
                        </div>
                    </Link>
                </div>

                {/* ПРАВА ЧАСТИНА: ПОШУК + ЮЗЕР */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    
                    {/* ПОШУК */}
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

                            {isSearchOpen && (
                                <div className="absolute top-full right-0 w-full mt-2 bg-ash border border-border rounded-lg shadow-2xl shadow-black overflow-hidden z-[100] max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {searchResults.users.length > 0 && (
                                        <div className="p-2 border-b border-border">
                                            <header className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-widest flex justify-between font-mono">
                                                <span>Souls</span><UserIcon className="w-3 h-3" />
                                            </header>
                                            {searchResults.users.map(u => (
                                                <Link key={u.id} to={`/user/${u.nickname}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-3 p-2 hover:bg-charcoal rounded-md transition group">
                                                    <div className="w-8 h-8 rounded-full bg-deep border border-border overflow-hidden shrink-0">
                                                        <img src={u.avatar_url ? `http://localhost:3000${u.avatar_url}` : defaultAvatarImg} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm font-medium text-bone group-hover:text-blood transition font-mono">{u.nickname}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.collections.length > 0 && (
                                        <div className="p-2">
                                            <header className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-widest flex justify-between font-mono">
                                                <span>Grimoires</span><Squares2X2Icon className="w-3 h-3" />
                                            </header>
                                            {searchResults.collections.map(c => (
                                                <Link key={c.id} to={`/collections/${c.id}`} onClick={() => setIsSearchOpen(false)} className="flex items-center justify-between p-2 hover:bg-charcoal rounded-md transition group">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-1.5 bg-void border border-border rounded text-muted group-hover:text-blood transition shrink-0">{getCollIcon(c.type)}</div>
                                                        <div className="min-w-0 leading-tight">
                                                            <p className="text-sm font-bold text-bone truncate group-hover:text-blood transition font-mono">{c.title}</p>
                                                            <p className="text-[10px] text-muted truncate">{c.author}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[9px] font-mono text-muted bg-black/40 px-1.5 py-0.5 rounded border border-border shrink-0 ml-2">{c.item_count}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.users.length === 0 && searchResults.collections.length === 0 && (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-muted font-mono">Nothing found in the void for <span className="text-blood italic">"{searchQuery}"</span></p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ЮЗЕР */}
                    <div className="shrink-0">
                        {user ? (
                            <UserDropdown user={user} onLogout={handleLogout} />
                        ) : (
                            <Link to="/auth" className="bg-blood/10 border border-blood hover:bg-blood text-blood hover:text-white px-6 py-2 text-xs font-bold uppercase tracking-widest transition font-mono">
                                Enter
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;