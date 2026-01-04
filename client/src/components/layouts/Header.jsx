import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Bars3Icon, XMarkIcon, MagnifyingGlassIcon, 
    ArrowRightOnRectangleIcon, 
    Squares2X2Icon, // Moodboard
    QueueListIcon,  // Series
    SparklesIcon,   // Exhibition
    UserIcon
} from '@heroicons/react/24/outline';
import UserDropdown from './UserDropdown';
import api from '../../api/axios';

import catSpriteImg from '../../assets/cat-sprite.png';
import defaultAvatar from '../../assets/default-avatar.png'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAvatarUrl = (path) => {
    if (!path || path === 'null' || path === 'undefined') return defaultAvatar;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
};

const getCollectionIcon = (type) => {
    switch (type) {
        case 'SERIES': return QueueListIcon;
        case 'EXHIBITION': return SparklesIcon;
        default: return Squares2X2Icon; 
    }
};

const Header = ({ user, logout, isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], collections: [] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
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
        
        if (searchQuery.length < 2) {
            setSearchResults({ users: [], collections: [] });
            if (searchQuery.length === 0) setIsSearchOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            setIsSearchOpen(true);
            try {
                const res = await api.get(`/search?q=${searchQuery}`);
                setSearchResults(res.data);
            } catch (e) { 
                console.error(e); 
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, user]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const hasResults = searchResults.users.length > 0 || searchResults.collections.length > 0;

    return (
        <header className="h-16 border-b border-border bg-deep shadow-lg shadow-black/50 relative z-50">
            <div className="max-w-480 mx-auto px-4 h-full flex items-center justify-between gap-4">
                
                {/* боковушка + ім'я */}
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
                        <span className="font-gothic text-2xl font-bold text-blood tracking-widest hidden sm:inline group-hover:text-blood-hover transition-colors">
                            CherryPick
                        </span>
                        <div className="w-8 h-8 overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
                            <img src={catSpriteImg} alt="Cat" className="max-w-none h-full absolute top-0 left-0 animate-sprite-run" />
                        </div>
                    </Link>
                </div>

                {/* пошук+профіль */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    
                    {/* пошук */}
                    {user && (
                        <div className="relative w-full max-w-xs md:max-w-sm" ref={searchRef}>
                            <div className="flex items-center bg-ash border border-border rounded-md px-3 py-1.5 focus-within:border-blood transition-all w-full">
                                <MagnifyingGlassIcon className="w-4 h-4 text-muted shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-xs ml-2 w-full text-bone placeholder-muted/50 font-mono min-w-0"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.length > 0) setIsSearchOpen(true);
                                    }}
                                    onFocus={() => searchQuery.length > 0 && setIsSearchOpen(true)}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="ml-2 text-muted hover:text-white">
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {isSearchOpen && (
                                <div className="absolute top-full right-0 w-full mt-2 bg-ash border border-border rounded-lg shadow-2xl shadow-black overflow-hidden z-100 max-h-100 overflow-y-auto custom-scrollbar">
                                    
                                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                                        <div className="p-4 text-center text-xs text-muted/50 font-mono">
                                            Type at least 2 chars...
                                        </div>
                                    )}

                                    {isSearching && searchQuery.length >= 2 && (
                                        <div className="p-4 text-center text-xs text-muted font-mono animate-pulse">
                                            Scanning...
                                        </div>
                                    )}

                                    {!isSearching && !hasResults && searchQuery.length >= 2 && (
                                        <div className="p-4 text-center text-xs text-muted/50 font-mono">
                                            No artifacts found.
                                        </div>
                                    )}

                                    {/* рнзультат */}
                                    {!isSearching && hasResults && searchQuery.length >= 2 && (
                                        <>
                                            {/* художники */}
                                            {searchResults.users.length > 0 && (
                                                <div className="p-2">
                                                    <div className="flex items-center gap-2 px-2 mb-2 text-muted/50">
                                                        <UserIcon className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Artists</span>
                                                    </div>
                                                    
                                                    {searchResults.users.map(u => (
                                                        <Link 
                                                            key={u.id} 
                                                            to={`/user/${u.nickname}`} 
                                                            onClick={() => setIsSearchOpen(false)} 
                                                            className="flex items-center gap-3 p-2 hover:bg-void rounded-md transition group"
                                                        >
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-ash shrink-0">
                                                                <img 
                                                                    src={getAvatarUrl(u.avatar_url)} 
                                                                    alt={u.nickname}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium text-bone group-hover:text-blood transition font-mono truncate">
                                                                    {u.nickname}
                                                                </span>
                                                                {u.display_name && u.display_name !== u.nickname && (
                                                                    <span className="text-[9px] text-muted truncate">{u.display_name}</span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {(searchResults.users.length > 0 && searchResults.collections.length > 0) && (
                                                <div className="h-px bg-border/30 mx-2 my-1"></div>
                                            )}

                                            {/* колекції */}
                                            {searchResults.collections.length > 0 && (
                                                <div className="p-2">
                                                    <div className="flex items-center gap-2 px-2 mb-2 text-muted/50">
                                                        <Squares2X2Icon className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Collections</span>
                                                    </div>

                                                    {searchResults.collections.map(c => {
                                                        const TypeIcon = getCollectionIcon(c.type);
                                                        const authorName = c.author_name || c.author || c.username || 'Unknown';

                                                        return (
                                                            <Link 
                                                                key={c.id} 
                                                                to={`/collections/${c.id}`} 
                                                                onClick={() => setIsSearchOpen(false)} 
                                                                className="flex items-center gap-3 p-2 hover:bg-void rounded-md transition group"
                                                            >
                                                                <div className="w-8 h-8 rounded-sm bg-ash flex items-center justify-center border border-border text-muted shrink-0 overflow-hidden">
                                                                    {c.author_avatar ? (
                                                                         <img 
                                                                            src={getAvatarUrl(c.author_avatar)} 
                                                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition"
                                                                            onError={(e) => {e.target.style.display='none'}}
                                                                         />
                                                                    ) : (
                                                                        <TypeIcon className="w-4 h-4" />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-sm font-bold text-bone group-hover:text-blood transition font-gothic truncate">
                                                                        {c.title}
                                                                    </span>
                                                                    <span className="text-[9px] text-muted font-mono truncate flex items-center gap-1">
                                                                        <TypeIcon className="w-3 h-3 text-muted/50" />
                                                                        <span>by {authorName}</span>
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* профіль */}
                    <div className="shrink-0">
                        {user ? (
                            <UserDropdown 
                                user={{
                                    ...user, 
                                    avatarUrl: getAvatarUrl(user.avatar_url) 
                                }} 
                                onLogout={handleLogout} 
                            />
                        ) : (
                            <Link to="/auth" className="group flex items-center gap-2 px-6 py-2 text-xs font-bold font-mono uppercase tracking-widest bg-transparent border border-blood text-blood hover:bg-blood hover:text-white rounded-sm transition-all duration-300">
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