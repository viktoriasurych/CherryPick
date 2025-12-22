import { Link, useLocation } from 'react-router-dom';
import artworkService from '../services/artworkService';
import { 
    HomeIcon, 
    RectangleStackIcon, 
    ChartBarIcon, 
    Squares2X2Icon,
    PlusIcon,
    BookmarkIcon,
    DocumentTextIcon // <--- 1. ДОДАЙ НОВУ ІКОНКУ
} from '@heroicons/react/24/outline';

const Sidebar = ({ recentProjects = [], isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Головна', path: '/', icon: HomeIcon },
        { name: 'Архів проєктів', path: '/projects', icon: RectangleStackIcon },
        { name: 'Колекції', path: '/collections', icon: Squares2X2Icon },
        { name: 'Наліпки', path: '/notes', icon: DocumentTextIcon },
        { name: 'Збережене', path: '/saved', icon: BookmarkIcon },
        { name: 'Статистика', path: '/stats', icon: ChartBarIcon },
    ];

    return (
        <aside className={`
            fixed lg:sticky top-16 left-0 z-40
            h-[calc(100vh-64px)] 
            bg-slate-950 border-r border-slate-800 
            transition-all duration-300 ease-in-out
            
            /* 👇 ВИПРАВЛЕННЯ ТУТ: */
            /* Тепер ми керуємо шириною (w-64 або w-0) та зсувом. */
            /* Якщо відкрито: ширина 64, стоїть на місці. */
            /* Якщо закрито: ширина 0 (щоб не займала місце), ховається вліво. */
            ${isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 border-none'}
            
            shrink-0 overflow-y-auto overflow-x-hidden
        `}>
            <div className="p-4 flex flex-col h-full w-64"> {/* w-64 тут фіксує ширину контенту, щоб він не плющився при анімації */}
                {/* Навігація */}
                <nav className="space-y-1 mb-8">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose} // Закриває на мобілці, на десктопі можна прибрати якщо хочеш щоб лишалось
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                                    isActive 
                                    ? 'bg-cherry-900/20 text-cherry-400 font-bold border border-cherry-900/50' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="whitespace-nowrap">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Останні проєкти */}
                <div className="flex flex-col grow overflow-hidden">
                    <div className="flex items-center justify-between px-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            Останні проєкти
                        </span>
                        <Link to="/projects/new" className="text-slate-500 hover:text-cherry-500">
                            <PlusIcon className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-900">
                        {recentProjects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-slate-900 group transition-all"
                            >
                                <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0 group-hover:border-cherry-600">
                                    {project.image_path ? (
                                        <img 
                                            src={artworkService.getImageUrl(project.image_path)} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-cherry-950/30" />
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate font-medium">
                                    {project.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-900 text-[9px] text-slate-700 uppercase tracking-tighter text-center whitespace-nowrap">
                    CherryPick v1.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;