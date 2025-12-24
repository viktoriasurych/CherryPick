import { Link, useLocation } from 'react-router-dom';
import artworkService from '../../services/artworkService';
import { 
    HomeIcon, RectangleStackIcon, ChartBarIcon, Squares2X2Icon,
    PlusIcon, BookmarkIcon, DocumentTextIcon, ClockIcon, PaintBrushIcon
} from '@heroicons/react/24/outline';

import defaultCollectionImg from '../assets/default-collection.png';
import defaultArtImg from '../assets/default-art.png';

const Sidebar = ({ recentProjects = [], recentCollections = [], isOpen, onClose, onOpenCollectionModal }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Головна', path: '/', icon: HomeIcon },
        { name: 'Сеанс', path: '/session', icon: ClockIcon }, // 👈 Годинник
        { name: 'Архів проєктів', path: '/projects', icon: RectangleStackIcon },
        { name: 'Колекції', path: '/collections', icon: Squares2X2Icon },
        { name: 'Наліпки', path: '/notes', icon: DocumentTextIcon },
        { name: 'Збережене', path: '/saved', icon: BookmarkIcon },
        { name: 'Статистика', path: '/stats', icon: ChartBarIcon },
    ];

    const renderThumbnail = (imagePath, isCollection = false) => {
        const src = imagePath 
            ? artworkService.getImageUrl(imagePath) 
            : (isCollection ? defaultCollectionImg : defaultArtImg);

        return (
            <img 
                src={src} 
                alt="" 
                className={`w-full h-full object-cover transition-opacity ${imagePath ? 'opacity-80 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-80'}`} 
            />
        );
    };

    return (
        <aside className={`
            /* 👇 ТВОЇ СТАРІ СТИЛІ (ПОВЕРНУЛИ) */
            fixed lg:sticky top-16 left-0 z-40
            h-[calc(100vh-64px)]
            bg-slate-950 border-r border-slate-800
            transition-all duration-300 ease-in-out
            
            ${isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 border-none'}
            
            shrink-0 overflow-y-auto overflow-x-hidden
        `}>
            <div className="p-4 flex flex-col h-full w-64"> 
                {/* Навігація */}
                <nav className="space-y-1 mb-8">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
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

                {/* 1. Останні проєкти */}
                <div className="mb-6">
                    <div className="flex items-center justify-between px-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            Останні проєкти
                        </span>
                        <Link to="/projects/new" onClick={onClose} className="text-slate-500 hover:text-cherry-500">
                            <PlusIcon className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {recentProjects.length === 0 && <div className="px-3 text-[10px] text-slate-700">Пусто...</div>}
                        {recentProjects.slice(0, 5).map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-slate-900 group transition-all"
                            >
                                <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0 group-hover:border-cherry-600">
                                    {renderThumbnail(project.image_path, false)}
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate font-medium">
                                    {project.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 2. Останні колекції (З кнопкою +) */}
                <div className="flex flex-col grow overflow-hidden">
                    <div className="flex items-center justify-between px-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            Останні колекції
                        </span>
                        {/* Кнопка викликає модалку */}
                        <button 
                            onClick={(e) => { e.preventDefault(); onClose(); onOpenCollectionModal(); }} 
                            className="text-slate-500 hover:text-cherry-500"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-900">
                        {recentCollections.length > 0 ? (
                            recentCollections.slice(0, 3).map((col) => (
                                <Link
                                    key={col.id}
                                    to={`/collections/${col.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-slate-900 group transition-all"
                                >
                                    <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 shrink-0 overflow-hidden group-hover:border-cherry-600">
                                        {renderThumbnail(col.cover_image, true)}
                                    </div>
                                    <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate font-medium">
                                        {col.title}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="px-3 text-[10px] text-slate-700">Пусто...</div>
                        )}
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