import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BackButton = ({ label = 'Return', fallbackPath = '/', className = '' }) => {
    const navigate = useNavigate();

    const handleBack = (e) => {
        e.preventDefault();
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <button 
            onClick={handleBack}
            className={`text-muted hover:text-blood text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-all group font-mono ${className}`}
        >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            <span>{label}</span>
        </button>
    );
};

export default BackButton;