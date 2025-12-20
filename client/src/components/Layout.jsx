import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 1. Link тут важливий
import { useAuth } from '../hooks/useAuth';
import artworkService from '../services/artworkService';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import defaultAvatar from '../assets/default-avatar.png'; 

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [recentProjects, setRecentProjects] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            artworkService.getAll({}, { by: 'updated', dir: 'DESC' })
                .then(data => setRecentProjects(data.slice(0, 10)))
                .catch(console.error);
        }
    }, [user]);

    const handleLogout = (e) => {
        e.preventDefault(); // Щоб клік не спрацював на Link
        e.stopPropagation();
        logout();
        navigate('/auth');
    };

    const userAvatar = user?.avatar_url 
        ? `http://localhost:3000${user.avatar_url}` 
        : defaultAvatar;

    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-bone-200 overflow-hidden">
            
            {/* === HEADER (ШАПКА) === */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
                    
                    {/* Ліва частина: Гамбургер + Лого */}
                    <div className="flex items-center gap-4">
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

                    {/* Центр: Пошук */}
                    <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 w-full max-w-sm group focus-within:border-cherry-700 transition-all">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-600" />
                        <input type="text" placeholder="Type / to search" className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-300" />
                    </div>

                    {/* 👇 ПРАВА ЧАСТИНА: ЗОНА КОРИСТУВАЧА 👇 */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {user && (
                            // МИ РОБИМО ВЕСЬ ЦЕЙ БЛОК ПОСИЛАННЯМ НА /profile
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                                title="Мій профіль"
                            >
                                {/* Текст (Привіт, Нікнейм) */}
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-slate-500 leading-none">Привіт,</p>
                                    <p className="text-sm text-bone-100 font-bold">{user.nickname || 'Митець'}</p>
                                </div>
                                
                                {/* Аватарка */}
                                <div className="w-8 h-8 rounded-full border border-slate-700 overflow-hidden shadow-lg group-hover:border-cherry-500 transition-colors">
                                    <img 
                                        src={userAvatar} 
                                        alt="User" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        )}

                        {/* Кнопка виходу окремо */}
                        <button onClick={handleLogout} className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-500 transition">
                            Вийти
                        </button>
                    </div>
                </div>
            </header>

            {/* ТІЛО САЙТУ */}
            <div className="flex flex-1 relative overflow-hidden">
                <Sidebar recentProjects={recentProjects} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                
                {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

                <main className="flex-1 bg-vampire-950 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="max-w-[1300px] mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;