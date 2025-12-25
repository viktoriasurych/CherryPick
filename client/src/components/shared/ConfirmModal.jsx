import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Log Out" }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="
                    relative w-full max-w-sm 
                    bg-gradient-to-b from-ash to-void 
                    border border-blood/20 
                    rounded-sm 
                    shadow-2xl shadow-black 
                    transform scale-100 transition-all
                    overflow-hidden
                "
            >
                {/* Фонова текстура */}
                <ExclamationTriangleIcon className="absolute -right-6 -top-6 w-32 h-32 text-blood/5 pointer-events-none rotate-12" />

                <div className="p-8 relative z-10">
                    {/* Заголовок */}
                    <h3 className="font-gothic text-xl text-bone mb-1 tracking-widest">
                        {title}
                    </h3>
                    
                    {/* 👇 ПОВЕРНУЛИ ЧЕРВОНИЙ КОЛІР (text-blood) */}
                    <p className="text-[10px] text-blood font-bold uppercase tracking-[0.2em] mb-6 opacity-80">
                        System Warning
                    </p>
                    
                    {/* Текст з рискою */}
                    <div className="flex gap-4 mb-8">
                        <div className="w-1 min-h-full bg-blood/40 rounded-full"></div>
                        <p className="text-muted text-sm font-mono leading-relaxed py-1">
                            {message}
                        </p>
                    </div>

                    {/* Кнопки */}
                    <div className="flex items-center justify-end gap-4">
                        <button 
                            onClick={onClose}
                            className="
                                px-4 py-2 
                                text-xs font-bold uppercase tracking-wider font-mono
                                text-muted/50 hover:text-bone 
                                transition-colors duration-300
                            "
                        >
                            Cancel
                        </button>
                        
                        <button 
                            onClick={onConfirm}
                            className="
                                relative group
                                px-6 py-2 
                                bg-transparent border border-blood/50 
                                text-blood text-xs font-bold uppercase tracking-wider font-mono
                                hover:bg-blood hover:text-white hover:border-blood
                                transition-all duration-300
                                rounded-sm
                            "
                        >
                            <span className="relative z-10">{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;