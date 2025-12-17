import { useState, useEffect, useRef } from 'react';
import dictionaryService from '../../services/dictionaryService';

const MultiDictSelect = ({ type, selectedIds = [], onChange, label }) => {
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    
    // 👇 1. Додали стан завантаження, щоб не натискати двічі
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const wrapperRef = useRef(null);

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

    const handleSelect = (id) => {
        // Запобігаємо дублюванню ID в масиві
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
        
        // 👇 2. БЛОКУВАННЯ: Якщо вже відправляємо - стоп
        if (isSubmitting) return;

        // 👇 3. ПЕРЕВІРКА: Може такий вже є в списку, просто ми його не помітили?
        const existingItem = items.find(i => i.name.toLowerCase() === trimmedInput.toLowerCase());
        if (existingItem) {
            handleSelect(existingItem.id); // Просто вибираємо його
            return;
        }

        setIsSubmitting(true); // Блокуємо
        try {
            const newItem = await dictionaryService.create(type, trimmedInput);
            setItems((prev) => [...prev, newItem]);
            // Важливо: додаємо ID через колбек, щоб уникнути проблем зі станом
            const newSelectedIds = [...selectedIds, newItem.id];
            onChange(newSelectedIds);
            
            setInputValue('');
            setShowDropdown(false);
        } catch (error) {
            alert(error.response?.data?.message || "Помилка створення");
        } finally {
            setIsSubmitting(false); // Розблоковуємо
        }
    };

    const handleDeleteFromDict = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Видалити цей варіант назавжди?")) return;
        try {
            await dictionaryService.delete(type, id);
            setItems(items.filter(item => item.id !== id));
            if (selectedIds.includes(id)) handleRemove(id);
        } catch (error) {
            alert("Не вдалося видалити");
        }
    };

    // Фільтрація для відображення
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedIds.includes(item.id)
    );

    // Перевірка на повне співпадіння (щоб не показувати "Створити", якщо таке вже є)
    const exactMatchExists = items.some(item => 
        item.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    const selectedItemsObjects = items.filter(item => selectedIds.includes(item.id));

    return (
        <div className="mb-4" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
            
            <div className="bg-slate-950 border border-slate-700 rounded p-2 flex flex-wrap gap-2 focus-within:border-cherry-500 transition relative">
                
                {/* Чіпси (вибрані) */}
                {selectedItemsObjects.map(item => (
                    <span key={item.id} className="bg-slate-800 text-bone-200 text-sm px-2 py-1 rounded flex items-center gap-2 border border-slate-700 animate-fade-in">
                        {item.name}
                        <button 
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="text-slate-500 hover:text-red-400 font-bold px-1"
                        >
                            ×
                        </button>
                    </span>
                ))}

                {/* Інпут */}
                <input 
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
                            } else if (!exactMatchExists) {
                                handleCreate();
                            }
                        }
                    }}
                    placeholder={selectedIds.length === 0 ? "Оберіть або введіть..." : ""}
                    className="bg-transparent outline-none text-bone-200 min-w-30 flex-1 h-8"
                    disabled={isSubmitting} // Блокуємо інпут при відправці
                />

                {/* Випадаючий список */}
                {showDropdown && (inputValue || filteredItems.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded shadow-xl max-h-60 overflow-y-auto z-50">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className="p-2 hover:bg-slate-800 cursor-pointer text-sm text-bone-200 flex justify-between group"
                            >
                                <span>{item.name}</span>
                                {item.user_id && (
                                    <button 
                                        onClick={(e) => handleDeleteFromDict(e, item.id)}
                                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2"
                                        title="Видалити назавжди"
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Кнопка створення */}
                        {inputValue && !exactMatchExists && (
                            <div 
                                onClick={handleCreate}
                                className={`p-2 border-t border-slate-800 text-sm cursor-pointer flex items-center gap-2
                                    ${isSubmitting ? 'text-slate-500 cursor-wait' : 'text-cherry-400 hover:bg-slate-800'}
                                `}
                            >
                                {isSubmitting ? '⏳ Додавання...' : `+ Створити "${inputValue}"`}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiDictSelect;