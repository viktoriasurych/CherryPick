import { useState } from 'react';

const FilterAccordion = ({ title, children, count = 0, isOpenDefault = false }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="border-b border-slate-800 py-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left focus:outline-none group"
            >
                <div className="flex items-center gap-2">
                    <span className="font-bold text-bone-200 group-hover:text-cherry-400 transition text-sm uppercase tracking-wide">
                        {title}
                    </span>
                    {count > 0 && (
                        <span className="bg-cherry-900 text-cherry-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                            {count}
                        </span>
                    )}
                </div>
                <span className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-125 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
};

export default FilterAccordion;