import { Link, useLocation } from 'react-router-dom';

// 👇 Два кроки назад
import artworkService from '../../services/artworkService';

import { 
    HomeIcon, RectangleStackIcon, ChartBarIcon, Squares2X2Icon,
    PlusIcon, BookmarkIcon, DocumentTextIcon, ClockIcon, PaintBrushIcon
} from '@heroicons/react/24/outline';

// 👇 Правильні шляхи
import defaultCollectionImg from '../../assets/default-collection.png';
import defaultArtImg from '../../assets/default-art.png';

const Sidebar = ({ recentProjects = [], recentCollections = [], isOpen, onClose, onOpenCollectionModal }) => {
    const location = useLocation();

    // Англійські назви пунктів
    const menuItems = [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Session', path: '/session', icon: ClockIcon },
        { name: 'Archive', path: '/projects', icon: RectangleStackIcon },
        { name: 'Grimoires', path: '/collections', icon: Squares2X2Icon }, // Колекції = Гримуари
        { name: 'Notes', path: '/notes', icon: DocumentTextIcon },
        { name: 'Saved', path: '/saved', icon: BookmarkIcon },
        { name: 'Stats', path: '/stats', icon: ChartBarIcon },
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
            fixed lg:sticky top-16 left-0 z-40
            h-[calc(100vh-64px)]
            bg-deep border-r border-border
            transition-all duration-300 ease-in-out
            
            ${isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 border-none'}
            
            shrink-0 overflow-y-auto overflow-x-hidden font-mono
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
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all
                                    ${isActive 
                                        ? 'bg-blood/10 text-blood font-bold border-l-2 border-blood pl-[10px]' // Активна: з червоною лінією зліва
                                        : 'text-muted hover:bg-charcoal hover:text-bone border-l-2 border-transparent'
                                    }
                                `}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-blood' : 'text-muted'}`} />
                                <span className="whitespace-nowrap">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* 1. Останні проєкти (Recent Works) */}
                <div className="mb-6">
                    <div className="flex items-center justify-between px-3 mb-3 border-b border-border pb-1">
                        <span className="text-[9px] font-bold text-muted/50 uppercase tracking-[0.2em] whitespace-nowrap">
                            Recent Works
                        </span>
                        <Link to="/projects/new" onClick={onClose} className="text-muted hover:text-blood transition-colors">
                            <PlusIcon className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {recentProjects.length === 0 && <div className="px-3 text-[10px] text-muted italic">The void is empty...</div>}
                        {recentProjects.slice(0, 5).map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-sm hover:bg-charcoal group transition-all"
                            >
                                <div className="w-5 h-5 rounded-sm bg-ash overflow-hidden border border-border shrink-0 group-hover:border-blood transition-colors">
                                    {renderThumbnail(project.image_path, false)}
                                </div>
                                <span className="text-xs text-muted group-hover:text-bone truncate font-medium transition-colors">
                                    {project.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 2. Останні колекції (Grimoires) */}
                <div className="flex flex-col grow overflow-hidden">
                    <div className="flex items-center justify-between px-3 mb-3 border-b border-border pb-1">
                        <span className="text-[9px] font-bold text-muted/50 uppercase tracking-[0.2em] whitespace-nowrap">
                            Grimoires
                        </span>
                        <button 
                            onClick={(e) => { e.preventDefault(); onClose(); onOpenCollectionModal(); }} 
                            className="text-muted hover:text-blood transition-colors"
                        >
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                        {recentCollections.length > 0 ? (
                            recentCollections.slice(0, 3).map((col) => (
                                <Link
                                    key={col.id}
                                    to={`/collections/${col.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-sm hover:bg-charcoal group transition-all"
                                >
                                    <div className="w-5 h-5 rounded-sm bg-ash border border-border shrink-0 overflow-hidden group-hover:border-blood transition-colors">
                                        {renderThumbnail(col.cover_image, true)}
                                    </div>
                                    <span className="text-xs text-muted group-hover:text-bone truncate font-medium transition-colors">
                                        {col.title}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="px-3 text-[10px] text-muted italic">No tomes found...</div>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border text-[9px] text-muted/30 uppercase tracking-widest text-center whitespace-nowrap">
                    CherryPick v1.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;