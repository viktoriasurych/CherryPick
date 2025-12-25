import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate замість Link для контролю
import { ArrowLongLeftIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../shared/ConfirmModal'; // Наша модалка

const EditorLayout = ({ title, backLink, isSaving, hasChanges, onSave, children, actions }) => {
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Функція, яка спрацьовує при спробі вийти
    const handleBackClick = (e) => {
        e.preventDefault();
        if (hasChanges) {
            setShowExitConfirm(true); // Якщо є зміни - питаємо
        } else {
            navigate(backLink); // Якщо немає - йдемо
        }
    };

    const confirmExit = () => {
        setShowExitConfirm(false);
        navigate(backLink);
    };

    return (
        <div className="min-h-screen pb-40 p-4 md:p-8 max-w-6xl mx-auto font-mono">
            {/* --- HEADER --- */}
            <div className="sticky top-4 z-30 bg-ash/90 backdrop-blur-md border border-border p-4 rounded-sm flex justify-between items-center mb-8 shadow-2xl shadow-black">
                <div className="flex items-center gap-4">
                    {/* Кнопка НАЗАД з перевіркою */}
                    <button onClick={handleBackClick} className="text-muted hover:text-blood transition-colors">
                        <ArrowLongLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-gothic text-xl text-bone tracking-widest hidden sm:block">
                        {title}
                    </h1>
                </div>

                <div className="flex gap-3 items-center">
                    {hasChanges && (
                        <span className="text-[10px] text-blood animate-pulse font-bold uppercase tracking-tighter">
                            Unsaved Changes
                        </span>
                    )}
                    <button 
                        onClick={onSave} 
                        disabled={!hasChanges || isSaving}
                        className={`
                            px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2
                            ${hasChanges 
                                ? 'bg-blood/10 border border-blood text-blood shadow-[0_0_15px_rgba(159,18,57,0.2)] hover:bg-blood hover:text-white' 
                                : 'bg-void border border-border text-muted opacity-50 cursor-not-allowed'}
                        `}
                    >
                        {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {children}
            </div>

            {actions && (
                <div className="mt-20 pt-10 border-t border-blood/10 text-center">
                    {actions}
                </div>
            )}

            {/* МОДАЛКА ВИХОДУ */}
            <ConfirmModal 
                isOpen={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                onConfirm={confirmExit}
                title="Abandon Ritual?"
                message="You have unsaved changes. Leaving now will cause them to be lost in the void forever."
                confirmText="Leave Anyway"
            />
        </div>
    );
};

export default EditorLayout;