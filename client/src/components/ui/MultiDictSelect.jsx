import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import dictionaryService from '../../services/dictionaryService';

const MultiDictSelect = ({ type, selectedIds = [], onChange, label }) => {
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadItems();
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [type]);

    const loadItems = async () => {
        try {
            const data = await dictionaryService.getAll(type);
            setItems(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            setShowDropdown(true);
        }
    };

    const handleSelect = (id) => {
        if (!selectedIds.includes(id)) {
            onChange([...selectedIds, id]);
        }
        setInputValue('');
        setShowDropdown(false);
    };

    const handleRemove = (idToRemove) => {
        onChange(selectedIds.filter(id => id !== idToRemove));
    };

    const handleCreate = async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isSubmitting) return;

        const existingItem = items.find(i => i.name.toLowerCase() === trimmedInput.toLowerCase());
        if (existingItem) {
            handleSelect(existingItem.id);
            return;
        }

        setIsSubmitting(true);
        try {
            const newItem = await dictionaryService.create(type, trimmedInput);
            setItems((prev) => [...prev, newItem]);
            onChange([...selectedIds, newItem.id]);
            setInputValue('');
            setShowDropdown(false);
        } catch (error) {
            alert(error.response?.data?.message || "Creation Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFromDict = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Permanently delete this from the dictionary? This affects all projects.")) return;
        try {
            await dictionaryService.delete(type, id);
            setItems(items.filter(item => item.id !== id));
            if (selectedIds.includes(id)) handleRemove(id);
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedIds.includes(item.id)
    );

    const exactMatchExists = items.some(item => 
        item.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    const selectedItemsObjects = items.filter(item => selectedIds.includes(item.id));

    return (
        <div className="mb-4 font-mono" ref={wrapperRef}>
            <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-[0.2em]">
                {label}
            </label>
            
            <div 
                onClick={handleContainerClick}
                className="bg-void border border-border rounded-sm p-2 flex flex-wrap gap-2 focus-within:border-blood focus-within:shadow-[0_0_10px_rgba(159,18,57,0.2)] transition-all relative min-h-[46px] cursor-text"
            >
                {/* Selected Items (Gothic Pills) */}
                {selectedItemsObjects.map(item => (
                    <span 
                        key={item.id} 
                        className="inline-flex items-center gap-1.5 bg-blood/10 text-blood border border-blood/30 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider animate-in fade-in zoom-in-95 duration-200 hover:bg-blood/20 transition-colors"
                    >
                        {item.name}
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                            className="w-4 h-4 flex items-center justify-center hover:text-white transition-colors"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                {/* Input */}
                <input 
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredItems.length > 0) {
                                handleSelect(filteredItems[0].id);
                            } else if (!exactMatchExists && inputValue.trim()) {
                                handleCreate();
                            }
                        }
                    }}
                    placeholder={selectedIds.length === 0 ? "Select or type..." : ""}
                    className="bg-transparent outline-none text-bone text-xs min-w-[120px] flex-1 h-7 placeholder-muted/50 font-mono"
                    disabled={isSubmitting}
                />

                {/* Dropdown */}
                {showDropdown && (inputValue || filteredItems.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-ash border border-border rounded-sm shadow-2xl shadow-black max-h-60 overflow-y-auto z-50 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className="px-4 py-2.5 hover:bg-void cursor-pointer text-xs text-muted hover:text-bone flex justify-between items-center group transition-colors border-b border-border/10 last:border-none font-mono"
                            >
                                <span>{item.name}</span>
                                
                                {item.user_id && (
                                    <button 
                                        onClick={(e) => handleDeleteFromDict(e, item.id)}
                                        className="p-1 text-muted hover:text-blood transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete from dictionary"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Create Option */}
                        {inputValue && !exactMatchExists && (
                            <div 
                                onClick={handleCreate}
                                className={`
                                    px-4 py-3 border-t border-border text-xs cursor-pointer flex items-center gap-2 font-bold uppercase tracking-wider
                                    ${isSubmitting ? 'text-muted cursor-wait' : 'text-blood hover:bg-void hover:text-white transition-colors'}
                                `}
                            >
                                {isSubmitting ? 'Adding...' : `+ Create "${inputValue}"`}
                            </div>
                        )}
                        
                        {filteredItems.length === 0 && !inputValue && (
                            <div className="px-4 py-3 text-xs text-muted/50 italic text-center tracking-wider">
                                Nothing found...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiDictSelect;