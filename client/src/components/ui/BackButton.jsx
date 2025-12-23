import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BackButton = ({ 
    label = 'Назад', 
    fallbackPath = '/', // Куди йти, якщо немає історії (наприклад, при відкритті в новій вкладці)
    className = '' 
}) => {
    const navigate = useNavigate();

    const handleBack = (e) => {
        e.preventDefault();
        
        // Перевіряємо, чи є історія навігації в межах нашого додатку
        // window.history.state.idx > 0 означає, що ми не на першій сторінці сесії
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1); // Повертаємось назад (як кнопка браузера)
        } else {
            navigate(fallbackPath); // Йдемо на запасний варіант
        }
    };

    return (
        <button 
            onClick={handleBack}
            className={`text-slate-500 hover:text-cherry-500 text-sm inline-flex items-center gap-2 transition group cursor-pointer ${className}`}
        >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

export default BackButton;