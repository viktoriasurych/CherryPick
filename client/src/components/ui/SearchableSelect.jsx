import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Універсальний селект з пошуком
 */
const SearchableSelect = ({ options, value, onChange, placeholder, onCreate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // 1. Синхронізація: Коли ззовні змінюється value, оновлюємо текст в інпуті
    useEffect(() => {
        const selected = options.find(o => o.value == value);
        if (selected) {
            setSearchTerm(selected.label.toString());
        } else if (!value) {
            setSearchTerm('');
        }
    }, [value, options]);

    // 2. Закриття при кліку зовні (відновлюємо текст, якщо нічого не вибрали)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                // Якщо користувач щось писав, але не вибрав -> повертаємо попереднє значення
                const selected = options.find(o => o.value == value);
                if (selected) setSearchTerm(selected.label.toString());
                else setSearchTerm('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value, options]);

    // Фільтрація
    const filteredOptions = options.filter(opt => 
        opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setSearchTerm(option.label.toString());
        setIsOpen(false);
    };

    // 👇 Хендлер для кліку/фокусу
    const handleOpen = () => {
        setIsOpen(true);
        setSearchTerm(''); // 🔥 ОЧИЩАЄМО текст, щоб показати ВЕСЬ список
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <input 
                    type="text"
                    value={searchTerm}
                    // Якщо користувач почав писати - просто оновлюємо
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') onChange(null);
                    }}
                    // 👇 ГОЛОВНА ЗМІНА: При кліку або фокусі очищаємо фільтр
                    onClick={handleOpen}
                    onFocus={handleOpen}
                    
                    placeholder={placeholder}
                    className={`
                        w-full bg-slate-900 border text-white pl-3 pr-8 py-2 rounded-lg outline-none transition font-medium text-sm cursor-pointer
                        ${isOpen ? 'border-cherry-500 ring-1 ring-cherry-500' : 'border-slate-800 hover:border-slate-600'}
                    `}
                    readOnly={false} // Дозволяємо писати
                />
                
                {/* Стрілочка */}
                <ChevronDownIcon 
                    className={`w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 transition pointer-events-none ${isOpen ? 'rotate-180 text-cherry-500' : ''}`} 
                />
            </div>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`
                                        px-3 py-2 text-sm cursor-pointer hover:bg-slate-800 transition truncate
                                        ${opt.value === value ? 'text-cherry-400 font-bold bg-cherry-900/10' : 'text-slate-300'}
                                    `}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-xs text-slate-500 text-center italic">
                                Не знайдено
                            </div>
                        )}

                        {onCreate && searchTerm && filteredOptions.length === 0 && (
                            <div 
                                onClick={() => { onCreate(searchTerm); setIsOpen(false); }}
                                className="border-t border-slate-800 px-3 py-2 text-sm text-cherry-400 hover:bg-slate-800 cursor-pointer font-bold flex items-center gap-2"
                            >
                                <span>+ Створити "{searchTerm}"</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;