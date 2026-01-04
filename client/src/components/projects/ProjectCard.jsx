import { Link } from 'react-router-dom';
import artworkService from '../../services/artworkService';
import { ART_STATUSES } from '../../config/constants';
import { formatDate, formatFuzzyDate } from '../../utils/formatters';

const ProjectCard = ({ project }) => {

    const getStatusStyle = (s) => {
        switch(s) {
            case 'FINISHED': return 'bg-blood text-white border-blood';
            case 'IN_PROGRESS': return 'bg-white text-black border-white';
            case 'DROPPED': return 'bg-black text-muted border-muted';
            default: return 'bg-ash text-bone border-border';
        }
    };

    const getFooterInfo = () => {
       
        if (project.status === 'FINISHED' && project.finished_year) {
            return {
                label: 'Ended',
                date: formatFuzzyDate(project.finished_year, project.finished_month, project.finished_day),
                className: 'text-muted/60'
            };
        }

        if (project.last_session_date) {
            return {
                label: 'Updated',
                date: formatDate(project.last_session_date), 
                className: 'text-bone font-bold'
            };
        }

        return {
            label: 'Created',
            date: formatDate(project.created_date),
            className: 'text-muted/60'
        };
    };

    const footerInfo = getFooterInfo();

    return (
        <Link 
            to={`/projects/${project.id}`} 
            className="
                group block bg-void border border-border rounded-sm overflow-hidden 
                hover:border-blood transition-all duration-500 
                shadow-lg shadow-black/40 hover:shadow-[0_0_20px_rgba(159,18,57,0.2)] flex-col h-full
            "
        >
            <div className="aspect-4/3 w-full bg-black relative overflow-hidden flex items-center justify-center border-b border-border/30">
                <img 
                    src={artworkService.getImageUrl(project.image_path)} 
                    alt={project.title} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-in-out" 
                    loading="lazy"
                />
                <div className={`
                    absolute top-3 right-3 px-2 py-1 
                    text-[9px] font-bold uppercase tracking-[0.15em] 
                    border backdrop-blur-sm shadow-md font-mono
                    ${getStatusStyle(project.status)}
                `}>
                    {ART_STATUSES[project.status] || project.status}
                </div>
            </div>

            <div className="p-5 flex flex-col grow">
                <h3 className="text-sm font-bold text-bone group-hover:text-blood transition-colors truncate mb-3 uppercase tracking-wide font-mono">
                    {project.title}
                </h3>
                
                <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted mb-4 font-mono min-h-5">
                    {project.genre_name && (
                        <span className="bg-ash px-1.5 py-0.5 rounded-sm border border-border/50 truncate max-w-25 hover:text-bone transition-colors hover:border-border">
                            {project.genre_name}
                        </span>
                    )}
                    {project.genre_name && project.style_name && <span className="text-muted/40 font-bold text-xs">•</span>}
                    {project.style_name && (
                        <span className="bg-ash px-1.5 py-0.5 rounded-sm border border-border/50 truncate max-w-25 hover:text-bone transition-colors hover:border-border">
                            {project.style_name}
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-border/30 flex justify-between items-end">
                    <div className={`text-[9px] font-mono uppercase tracking-widest ${footerInfo.className}`}>
                        {footerInfo.label}: {footerInfo.date}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;