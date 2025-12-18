import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import artworkService from '../services/artworkService';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recentProjects, setRecentProjects] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Стан для відкриття/закриття

    // Закриваємо сайдбар при переході на іншу сторінку (особливо важливо для мобілки)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = await artworkService.getAll({}, { by: 'updated', dir: 'DESC' });
                setRecentProjects(data.slice(0, 10));
            } catch (error) {
                console.error("Sidebar fetch error:", error);
            }
        };
        if (user) fetchRecent();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-bone-200 overflow-hidden">
            
            {/* --- HEADER --- */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                        {/* КНОПКА ГАМБУРГЕР: тепер працює всюди */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-800 rounded-md transition text-slate-300"
                        >
                            {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>

                        <Link to="/projects" className="flex items-center gap-2 group shrink-0">
                            <span className="text-2xl">🍒</span>
                            <span className="font-pixel text-lg text-cherry-500 group-hover:text-cherry-400 transition uppercase hidden sm:inline">
                                CherryPick
                            </span>
                        </Link>
                    </div>

                    {/* Пошук */}
                    <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 w-full max-w-sm group focus-within:border-cherry-700 transition-all">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-600" />
                        <input 
                            type="text" 
                            placeholder="Type / to search" 
                            className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-300"
                        />
                        <span className="text-[10px] border border-slate-700 px-1.5 py-0.5 rounded text-slate-600 font-mono">/</span>
                    </div>

                    {/* Юзер */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-slate-500 leading-none">Привіт,</p>
                                    <p className="text-sm text-bone-100 font-bold">{user.nickname || 'Митець'}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cherry-900 to-cherry-600 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                    {user.nickname ? user.nickname[0].toUpperCase() : 'M'}
                                </div>
                            </div>
                        )}
                        <button onClick={handleLogout} className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-500">
                            Вийти
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                
                {/* --- SIDEBAR --- */}
                <Sidebar 
                    recentProjects={recentProjects} 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />

                {/* --- ТЕМНИЙ ФОН (Overlay) --- */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:z-30 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 bg-vampire-950 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="max-w-[1300px] mx-auto p-4 md:p-8">
                        {children}
                    </div>
                    <footer className="border-t border-slate-900 bg-black/20 py-10 mt-20">
                        <div className="max-w-6xl mx-auto px-4 text-center text-slate-600 text-[10px] tracking-widest uppercase">
                            <p>© 2025 CherryPick Archive • Created by Victoria</p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Layout;