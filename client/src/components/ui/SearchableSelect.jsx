import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SearchableSelect = ({ options, value, onChange, placeholder, onCreate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // 1. Синхронізація значення з текстом
    useEffect(() => {
        const selected = options.find(o => o.value == value);
        if (selected) {
            setSearchTerm(selected.label.toString());
        } else if (!value && !isOpen) { 
            setSearchTerm('');
        }
    }, [value, options, isOpen]);

    // 2. Клік зовні
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                const selected = options.find(o => o.value == value);
                if (selected) setSearchTerm(selected.label.toString());
                else if (!value) setSearchTerm('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value, options]);

    const filteredOptions = options.filter(opt => 
        opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setSearchTerm(option.label.toString());
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setSearchTerm(''); 
    };

    return (
        <div className="relative w-full font-mono" ref={wrapperRef}>
            <div className="relative group">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') onChange(null);
                    }}
                    onClick={handleOpen}
                    onFocus={handleOpen}
                    placeholder={placeholder}
                    className={`
                        w-full bg-void border p-3 pr-10 text-sm text-bone rounded-sm outline-none transition-all cursor-pointer
                        ${isOpen 
                            ? 'border-blood ring-1 ring-blood shadow-[0_0_10px_rgba(159,18,57,0.2)]' 
                            : 'border-border group-hover:border-muted'}
                    `}
                />
                
                <ChevronDownIcon 
                    className={`
                        w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none
                        ${isOpen ? 'rotate-180 text-blood' : 'group-hover:text-bone'}
                    `} 
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-ash border border-border rounded-sm shadow-2xl shadow-black z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`
                                        px-4 py-3 text-xs cursor-pointer transition-colors border-b border-border/10 last:border-none
                                        whitespace-normal break-words leading-relaxed
                                        ${opt.value === value 
                                            ? 'text-blood font-bold bg-blood/5' 
                                            : 'text-muted hover:text-bone hover:bg-void'}
                                    `}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[10px] text-muted text-center italic tracking-wider">
                                Nothing found...
                            </div>
                        )}

                        {onCreate && searchTerm && !filteredOptions.some(o => o.label.toLowerCase() === searchTerm.toLowerCase()) && (
                            <div 
                                onClick={() => { onCreate(searchTerm); setIsOpen(false); }}
                                className="border-t border-border px-4 py-3 text-xs text-blood hover:text-white hover:bg-blood cursor-pointer font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                            >
                                <span>+ Create "{searchTerm}"</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;