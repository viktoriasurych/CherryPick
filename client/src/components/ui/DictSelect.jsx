import { useState, useEffect } from 'react';
import dictionaryService from '../../services/dictionaryService';
import SearchableSelect from './SearchableSelect'; // 👈 Імпортуємо базу

const DictSelect = ({ type, value, onChange, label }) => {
    const [items, setItems] = useState([]);

    // 1. Завантажуємо дані
    useEffect(() => {
        const load = async () => {
            try {
                const data = await dictionaryService.getAll(type);
                // Перетворюємо у формат { value, label } для нашого компонента
                setItems(data.map(d => ({ value: d.id, label: d.name })));
            } catch (error) { console.error(error); }
        };
        load();
    }, [type]);

    // 2. Логіка створення
    const handleCreate = async (name) => {
        try {
            const newItem = await dictionaryService.create(type, name);
            const formattedItem = { value: newItem.id, label: newItem.name };
            setItems(prev => [...prev, formattedItem]);
            onChange(newItem.id); // Одразу вибираємо
        } catch (error) {
            alert("Помилка: " + error.message);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
            <SearchableSelect 
                options={items}
                value={value}
                onChange={onChange}
                onCreate={handleCreate} // 👇 Передаємо можливість створювати
                placeholder="Оберіть..."
            />
        </div>
    );
};

export default DictSelect;