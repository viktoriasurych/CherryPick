import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const FilterMultiSelect = ({ options = [], selectedIds = [], onChange, placeholder = "Select..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedIds.includes(String(opt.id))
    );

    const selectedItems = options.filter(opt => selectedIds.includes(String(opt.id)));

    const handleToggle = (e) => {
        if (e.target.closest('button')) return;
        
        e.preventDefault(); 
        setIsOpen(!isOpen);
        
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleSelect = (id) => {
        onChange([...selectedIds, String(id)]);
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleRemove = (id) => {
        onChange(selectedIds.filter(sid => sid !== String(id)));
    };

    return (
        <div className="relative font-mono w-full" ref={wrapperRef}>
            <div 
                className={`
                    bg-void border border-border rounded-sm p-1.5 flex flex-wrap gap-2 
                    transition-all min-h-9.5 cursor-pointer relative z-10
                    ${isOpen ? 'border-blood shadow-[0_0_10px_rgba(159,18,57,0.15)]' : 'hover:border-muted'}
                `}
                onMouseDown={handleToggle}
            >
                {selectedItems.map(item => (
                    <span 
                        key={item.id} 
                        className="inline-flex items-center gap-1 bg-ash border border-border text-[10px] text-bone px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                    >
                        {item.name}
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation();
                                handleRemove(item.id); 
                            }}
                            className="hover:text-blood transition-colors ml-0.5"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                <div className="flex-1 flex items-center min-w-15 relative">
                    <input 
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                        placeholder={selectedItems.length === 0 ? placeholder : ""}
                        className="bg-transparent outline-none text-xs text-bone placeholder-muted/40 w-full h-full py-1 pl-1 cursor-text"
                    />
                    <ChevronDownIcon 
                        className={`w-3 h-3 text-muted/50 absolute right-0 pointer-events-none transition-transform ${isOpen ? 'rotate-180 text-blood' : ''}`} 
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-ash border border-border rounded-sm shadow-2xl shadow-black z-60 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div 
                                key={opt.id}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(opt.id);
                                }}
                                className="px-3 py-2 text-xs text-muted hover:text-bone hover:bg-void cursor-pointer uppercase tracking-wider transition-colors border-b border-border/10 last:border-none"
                            >
                                {opt.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-[10px] text-muted/40 italic text-center">
                            {options.length === 0 ? "No data loaded" : "No matches"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterMultiSelect;