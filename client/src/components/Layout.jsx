import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-vampire-950 flex flex-col font-sans text-bone-200">
            
            {/* --- HEADER --- */}
            <header className="border-b border-cherry-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    
                    {/* Логотип */}
                    <Link to="/projects" className="flex items-center gap-2 group">
                        <span className="text-2xl">🍒</span>
                        <span className="font-pixel text-xl text-cherry-500 group-hover:text-cherry-400 transition">
                            CherryPick
                        </span>
                    </Link>

                    {/* Права частина: Юзер + Вихід */}
                    <div className="flex items-center gap-6">
                        {user && (
                            <span className="text-sm text-slate-400">
                                Привіт, <span className="text-bone-100 font-bold">{user.nickname || 'Митець'}</span>
                            </span>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                        >
                            Вийти
                        </button>
                    </div>
                </div>
                {/* Тонка лінія градієнту */}
                <div className="h-px bg-linear-to-r from-transparent via-cherry-700 to-transparent"></div>
            </header>

            {/* --- MAIN CONTENT (Тут будуть мінятися сторінки) --- */}
            <main className="grow">
                {children}
            </main>

            {/* --- FOOTER --- */}
            <footer className="border-t border-slate-900 bg-black py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-4 text-center text-slate-600 text-sm">
                    <p>© 2025 CherryPick Archive. Created by Victoria.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;