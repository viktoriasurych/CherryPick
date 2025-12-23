import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';

const ProjectCard = ({ project }) => { // 👈 Прибрали onDelete
    
    const isInactive = ['FINISHED', 'DROPPED', 'ON_HOLD'].includes(project.status);
    const showLastUpdate = !isInactive && project.last_session_date;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const getStatusColor = (s) => {
        switch(s) {
            case 'FINISHED': return 'bg-green-900/80 border-green-500 text-green-100';
            case 'DROPPED': return 'bg-red-900/80 border-red-500 text-red-100';
            case 'IN_PROGRESS': return 'bg-blue-900/80 border-blue-500 text-blue-100';
            default: return 'bg-black/70 border-slate-600 text-white';
        }
    };

    return (
        <Link 
            to={`/projects/${project.id}`} 
            className="group block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cherry-500/50 transition duration-300 shadow-lg hover:shadow-cherry-900/20 flex flex-col h-full"
        >
            {/* 1. КАРТИНКА */}
            <div className="h-64 w-full bg-black relative overflow-hidden flex items-center justify-center">
                <img 
                    src={artworkService.getImageUrl(project.image_path)} 
                    alt={project.title} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-700" 
                />
                
                <div className={`absolute top-2 right-2 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border shadow-lg uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                </div>
            </div>

            {/* 2. ІНФОРМАЦІЯ */}
            <div className="p-4 flex flex-col grow">
                <h3 className="text-lg font-bold text-bone-100 group-hover:text-cherry-400 transition truncate mb-1">
                    {project.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[100px]">
                        {project.genre_name || '—'}
                    </span>
                    <span>•</span>
                    <span>{project.started_year || new Date(project.created_date).getFullYear()}</span>
                </div>

                {/* Низ картки: Тільки Дата (без смітника) */}
                <div className="mt-auto pt-3 border-t border-slate-900">
                    <div className="text-[10px] text-slate-400 font-mono">
                        {showLastUpdate ? (
                            <span className="text-green-400">
                                Актив: {formatDate(project.last_session_date)}
                            </span>
                        ) : project.finished_year ? (
                            <span>Заверш: {project.finished_year}</span>
                        ) : (
                            <span>Створ: {formatDate(project.created_date)}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;