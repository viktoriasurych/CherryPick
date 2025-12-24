import { Link } from 'react-router-dom';
import { ArrowLongLeftIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EditorLayout = ({ 
    title, 
    backLink, 
    isSaving, 
    hasChanges, 
    onSave, 
    children,
    actions // Для додаткових кнопок (наприклад, видалити)
}) => {
    return (
        <div className="min-h-screen pb-40 p-4 md:p-8 max-w-6xl mx-auto">
            {/* --- STICKY HEADER --- */}
            <div className="sticky top-4 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex justify-between items-center mb-8 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Link to={backLink} className="text-slate-400 hover:text-white transition">
                        <ArrowLongLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white hidden sm:block">
                        {title}
                    </h1>
                </div>

                <div className="flex gap-3">
                    {hasChanges && (
                        <span className="text-xs text-yellow-500 flex items-center animate-pulse font-bold">
                            ● Є зміни
                        </span>
                    )}
                    <button 
                        onClick={onSave} 
                        disabled={!hasChanges || isSaving}
                        className={`
                            px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2
                            ${hasChanges 
                                ? 'bg-cherry-600 hover:bg-cherry-500 text-white shadow-lg shadow-cherry-900/40' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                        `}
                    >
                        {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                        {isSaving ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            {/* Ми передаємо сітку як children, щоб форми могли самі вирішувати, як розміщувати елементи */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {children}
            </div>

            {/* --- FOOTER ACTIONS (DELETE) --- */}
            {actions && (
                <div className="mt-20 pt-10 border-t border-red-900/20 text-center">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default EditorLayout;