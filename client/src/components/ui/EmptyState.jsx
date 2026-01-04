import { Link } from 'react-router-dom';
import sleepingCatGif from '../../assets/sleeping-cat.gif';

const EmptyState = ({ 
    title = "Silence...", 
    message = "The Void is empty.", 
    actionLabel, 
    actionLink, 
    onAction, 
    icon: Icon 
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <img 
                src={sleepingCatGif} 
                alt="Sleeping Cat" 
                className="w-32 h-32 object-contain opacity-80 mb-6 grayscale hover:grayscale-0 transition-all duration-500" 
            />
            
            <p className="text-bone text-lg font-gothic tracking-widest mb-2">
                {title}
            </p>
            
            <p className="text-muted text-xs font-mono mb-8 max-w-md mx-auto">
                {message}
            </p>
            
            {(actionLabel && (actionLink || onAction)) && (
                actionLink ? (
                    <Link 
                        to={actionLink} 
                        className="bg-blood hover:bg-blood-hover text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(159,18,57,0.3)] transition-all hover:scale-105 flex items-center gap-2"
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {actionLabel}
                    </Link>
                ) : (
                    <button 
                        onClick={onAction} 
                        className="text-blood hover:text-white font-bold text-xs uppercase tracking-widest border-b border-blood/30 hover:border-blood pb-1 transition-all flex items-center gap-2"
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
};

export default EmptyState;