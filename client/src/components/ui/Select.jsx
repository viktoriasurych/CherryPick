import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const Select = ({ value, options, onChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-sm cursor-pointer border transition-all select-none min-w-25 justify-between
                    bg-ash text-xs text-bone font-mono font-bold
                    ${isOpen ? 'border-blood shadow-[0_0_5px_rgba(159,18,57,0.3)]' : 'border-border hover:border-muted'}
                `}
            >
                <span>{selectedLabel}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-full bg-ash border border-border rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`
                                px-4 py-2 text-xs font-mono cursor-pointer transition-colors
                                ${opt.value === value ? 'bg-blood text-white font-bold' : 'text-muted hover:text-bone hover:bg-void'}
                            `}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;