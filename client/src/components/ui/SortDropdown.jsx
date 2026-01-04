import { useState, useRef, useEffect } from 'react';
import { BarsArrowDownIcon, BarsArrowUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const SortDropdown = ({ value, direction, onChange, onToggleDirection, options = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentOption = options?.find(o => o.value === value);
    const currentLabel = currentOption ? currentOption.label : value;

    return (
        <div className="relative h-10" ref={wrapperRef}>
            <div className="flex items-center h-full bg-void border border-border rounded-sm shadow-sm group hover:border-muted transition-colors">
                
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="
                        flex items-center justify-between gap-3 
                        bg-transparent h-full px-3 
                        min-w-40 cursor-pointer outline-none
                        text-muted hover:text-bone transition-colors
                    "
                >
                    <span className="text-xs uppercase tracking-wider font-bold text-left truncate">
                        {currentLabel}
                    </span>
                    
                    <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blood' : ''}`} 
                    />
                </button>
                
                <div className="w-px h-4 bg-border"></div>
                
                <button 
                    onClick={onToggleDirection} 
                    className="px-3 h-full text-muted hover:text-blood transition-colors flex items-center justify-center active:scale-95" 
                    title="Change Order"
                >
                    {direction === 'ASC' 
                        ? <BarsArrowUpIcon className="w-4 h-4"/> 
                        : <BarsArrowDownIcon className="w-4 h-4"/>
                    }
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-40 bg-ash border border-border rounded-sm shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {options.length > 0 ? (
                            options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors
                                        ${opt.value === value 
                                            ? 'text-blood bg-blood/5 border-l-2 border-blood pl-3.5' 
                                            : 'text-muted hover:text-bone hover:bg-void border-l-2 border-transparent'}
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-[10px] text-muted italic">No options</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortDropdown;