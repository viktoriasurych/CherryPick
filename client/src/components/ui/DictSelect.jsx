import { useState, useEffect, useRef } from 'react';
import dictionaryService from '../../services/dictionaryService';

const DictSelect = ({ type, value, onChange, label }) => {
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Завантаження
    useEffect(() => {
        loadItems();
    }, [type]);

    // Коли ззовні приходить value (ID), треба знайти його Name для інпута
    useEffect(() => {
        if (items.length > 0) {
            const selected = items.find(i => i.id == value);
            if (selected) setInputValue(selected.name);
            else if (!value) setInputValue('');
        }
    }, [value, items]);

    // Закриття при кліку повз
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
                // Якщо ми вийшли з поля і нічого не вибрали валидного -> скидаємо текст
                const selected = items.find(i => i.id == value);
                if (selected) setInputValue(selected.name);
                else setInputValue('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value, items]);

    const loadItems = async () => {
        try {
            const data = await dictionaryService.getAll(type);
            setItems(data);
        } catch (error) { console.error(error); }
    };

    // Вибір елемента зі списку
    const handleSelect = (item) => {
        onChange(item.id);
        setInputValue(item.name);
        setShowDropdown(false);
    };

    // Створення нового
    const handleCreate = async () => {
        if (!inputValue.trim()) return;
        try {
            const newItem = await dictionaryService.create(type, inputValue);
            setItems([...items, newItem]); // Додаємо в список
            handleSelect(newItem); // Одразу вибираємо
        } catch (error) {
            alert("Помилка створення: " + error.message);
        }
    };

    // Фільтрація
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className="mb-4 relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
            
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowDropdown(true);
                    // Якщо стерли текст -> скидаємо ID
                    if (e.target.value === '') onChange(''); 
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={`Оберіть або введіть...`}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none transition"
            />

            {showDropdown && (
                <div className="absolute z-10 w-full bg-slate-900 border border-slate-700 rounded shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {filteredItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={`p-2 hover:bg-slate-800 cursor-pointer text-sm ${item.id == value ? 'text-cherry-400 font-bold' : 'text-bone-200'}`}
                        >
                            {item.name}
                        </div>
                    ))}

                    {/* Якщо немає збігів і є текст -> показати кнопку створення */}
                    {inputValue && filteredItems.length === 0 && (
                        <div 
                            onClick={handleCreate}
                            className="p-2 border-t border-slate-800 text-cherry-400 hover:bg-slate-800 cursor-pointer text-sm"
                        >
                            + Створити "{inputValue}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DictSelect;