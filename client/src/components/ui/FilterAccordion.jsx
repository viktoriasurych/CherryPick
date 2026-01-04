import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FilterAccordion = ({ title, children, count = 0, isOpenDefault = false }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="border-b border-border/50 py-4 font-mono">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left focus:outline-none group"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted uppercase tracking-[0.2em] group-hover:text-blood transition-colors">
                        {title}
                    </span>
                    {count > 0 && (
                        <span className="bg-blood text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold min-w-5 text-center">
                            {count}
                        </span>
                    )}
                </div>
                <ChevronDownIcon 
                    className={`w-4 h-4 text-muted transition-transform duration-300 group-hover:text-blood ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>
            <div 
                className={`
                    transition-all duration-300 ease-in-out
                    ${isOpen 
                        ? 'max-h-250 opacity-100 mt-4 overflow-visible'
                        : 'max-h-0 opacity-0 overflow-hidden'} // 👈 overflow-hidden ховає контент при закритті
                `}
            >
                {children}
            </div>
        </div>
    );
};

export default FilterAccordion;