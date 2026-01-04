import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useSmartBack } from '../../hooks/useSmartBack'; // 👇 Імпорт хука

const BackButton = ({ label = 'Return', fallbackPath = '/', className = '' }) => {
    const goBack = useSmartBack();

    return (
        <button 
            onClick={(e) => { e.preventDefault(); goBack(fallbackPath); }}
            className={`text-muted hover:text-blood text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-all group font-mono ${className}`}
        >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            <span>{label}</span>
        </button>
    );
};

export default BackButton;