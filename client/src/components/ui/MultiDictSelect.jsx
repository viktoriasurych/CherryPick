import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'; // 👇 Красиві іконки
import dictionaryService from '../../services/dictionaryService';

const MultiDictSelect = ({ type, selectedIds = [], onChange, label }) => {
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Стан завантаження створення
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const wrapperRef = useRef(null);
    const inputRef = useRef(null); // 👇 Реф для фокусу

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
        if (!trimmedInput) return;
        
        if (isSubmitting) return;

        // Перевірка на існуючий (без урахування регістру)
        const existingItem = items.find(i => i.name.toLowerCase() === trimmedInput.toLowerCase());
        if (existingItem) {
            handleSelect(existingItem.id);
            return;
        }

        setIsSubmitting(true);
        try {
            const newItem = await dictionaryService.create(type, trimmedInput);
            setItems((prev) => [...prev, newItem]);
            const newSelectedIds = [...selectedIds, newItem.id];
            onChange(newSelectedIds);
            
            setInputValue('');
            setShowDropdown(false);
        } catch (error) {
            alert(error.response?.data?.message || "Помилка створення");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFromDict = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Видалити цей варіант зі словника назавжди? Це вплине на всі роботи.")) return;
        try {
            await dictionaryService.delete(type, id);
            setItems(items.filter(item => item.id !== id));
            if (selectedIds.includes(id)) handleRemove(id); // Видаляємо з вибраного, якщо він там був
        } catch (error) {
            alert("Не вдалося видалити");
        }
    };

    // Фільтрація
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedIds.includes(item.id)
    );

    const exactMatchExists = items.some(item => 
        item.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    const selectedItemsObjects = items.filter(item => selectedIds.includes(item.id));

    return (
        <div className="mb-4" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
            
            <div 
                onClick={handleContainerClick}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-wrap gap-2 focus-within:border-cherry-500 transition relative min-h-[46px] cursor-text"
            >
                
                {/* Вибрані елементи (Pills style) */}
                {selectedItemsObjects.map(item => (
                    <span 
                        key={item.id} 
                        className="inline-flex items-center gap-1.5 bg-cherry-900/30 text-cherry-200 border border-cherry-900/50 px-3 py-1 rounded-full text-sm font-medium animate-in fade-in zoom-in-95 duration-200"
                    >
                        {item.name}
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-cherry-900/50 text-cherry-300 transition"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                {/* Інпут */}
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
                            e.preventDefault(); // Щоб не сабмітилась форма
                            if (filteredItems.length > 0) {
                                handleSelect(filteredItems[0].id); // Вибираємо перший варіант
                            } else if (!exactMatchExists && inputValue.trim()) {
                                handleCreate(); // Або створюємо новий
                            }
                        }
                    }}
                    placeholder={selectedIds.length === 0 ? "Оберіть або введіть..." : ""}
                    className="bg-transparent outline-none text-white text-sm min-w-[120px] flex-1 h-8 placeholder-slate-600"
                    disabled={isSubmitting}
                />

                {/* Випадаючий список */}
                {showDropdown && (inputValue || filteredItems.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 custom-scrollbar">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-200 flex justify-between items-center group transition-colors"
                            >
                                <span>{item.name}</span>
                                
                                {/* 👇 Кнопка видалення тепер завжди видна (не opacity-0), але тьмяна */}
                                {item.user_id && (
                                    <button 
                                        onClick={(e) => handleDeleteFromDict(e, item.id)}
                                        className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-900/10 rounded transition"
                                        title="Видалити зі словника назавжди"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Кнопка створення */}
                        {inputValue && !exactMatchExists && (
                            <div 
                                onClick={handleCreate}
                                className={`px-3 py-2 border-t border-slate-800 text-sm cursor-pointer flex items-center gap-2
                                    ${isSubmitting ? 'text-slate-500 cursor-wait' : 'text-cherry-400 hover:bg-slate-800 font-bold'}
                                `}
                            >
                                {isSubmitting ? '⏳ Додавання...' : `+ Створити "${inputValue}"`}
                            </div>
                        )}
                        
                        {filteredItems.length === 0 && !inputValue && (
                            <div className="px-3 py-2 text-xs text-slate-500 italic text-center">
                                Список порожній
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiDictSelect;