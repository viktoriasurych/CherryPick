import { useState, useEffect } from 'react';
import dictionaryService from '../../services/dictionaryService';
import SearchableSelect from './SearchableSelect';

const DictSelect = ({ type, value, onChange, label }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await dictionaryService.getAll(type);
                setItems(data.map(d => ({ value: d.id, label: d.name })));
            } catch (error) { console.error(error); }
        };
        load();
    }, [type]);

    const handleCreate = async (name) => {
        try {
            const newItem = await dictionaryService.create(type, name);
            const formattedItem = { value: newItem.id, label: newItem.name };
            setItems(prev => [...prev, formattedItem]);
            onChange(newItem.id);
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="mb-4 text-left font-mono">
            <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-[0.2em]">
                {label}
            </label>
            <SearchableSelect 
                options={items}
                value={value}
                onChange={onChange}
                onCreate={handleCreate}
                placeholder="Select..."
            />
        </div>
    );
};

export default DictSelect;