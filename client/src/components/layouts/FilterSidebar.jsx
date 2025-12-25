import { useState, useEffect } from 'react';

// 👇 Виходимо з layouts (..), заходимо в ui
import FilterAccordion from '../ui/FilterAccordion';

// 👇 Виходимо з layouts (..), виходимо з components (..), заходимо в services
import dictionaryService from '../../services/dictionaryService';
const FilterSidebar = ({ isOpen, onClose, filters, setFilters, onApply, onReset }) => {
    const [genres, setGenres] = useState([]);
    const [styles, setStyles] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const loadDicts = async () => {
            try {
                const [g, s, m, t] = await Promise.all([
                    dictionaryService.getAll('genres'),
                    dictionaryService.getAll('styles'),
                    dictionaryService.getAll('materials'),
                    dictionaryService.getAll('tags')
                ]);
                setGenres(g);
                setStyles(s);
                setMaterials(m);
                setTags(t);
            } catch (e) { console.error(e); }
        };
        if (isOpen) loadDicts();
    }, [isOpen]);

    const handleCheckbox = (field, value) => {
        const list = filters[field] || [];
        const newList = list.includes(value) 
            ? list.filter(item => item !== value) 
            : [...list, value];
        setFilters({ ...filters, [field]: newList });
    };

    const STATUSES = {
        'PLANNED': '📅 Заплановано',
        'SKETCH': '✏️ Скетч',
        'IN_PROGRESS': '🚧 В процесі',
        'FINISHED': '✅ Завершено',
        'ON_HOLD': '⏸ На паузі',
        'DROPPED': '❌ Покинуто'
    };

    const FilterTag = ({ label, isActive, onClick, colorClass = "bg-slate-900 border-slate-700" }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs border transition ${
                isActive 
                ? 'bg-cherry-900 border-cherry-500 text-white' 
                : `${colorClass} text-slate-400 hover:border-slate-500 hover:text-white`
            }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`
                fixed top-0 right-0 h-full bg-slate-950 border-l border-slate-800 z-50 w-80 shadow-2xl flex flex-col
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                md:absolute md:right-0 md:h-full
            `}>
                {/* ХЕДЕР */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
                    <h2 className="font-bold text-bone-100 text-lg flex items-center gap-2">🌪 Фільтри</h2>
                    <button onClick={onReset} className="text-xs text-cherry-400 hover:text-cherry-300 transition border border-cherry-900/50 px-2 py-1 rounded">
                        ↻ Скинути
                    </button>
                </div>

                {/* СКРОЛ ЗОНА (Кнопка тепер всередині, внизу контенту) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                    
                    {/* 1. СТАТУС (Закритий за замовчуванням) */}
                    <FilterAccordion title="Статус" count={filters.status.length} isOpenDefault={false}>
                        <div className="space-y-2 pl-1">
                            {Object.entries(STATUSES).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-900/50 p-1 rounded transition">
                                    <input type="checkbox" checked={filters.status.includes(key)} onChange={() => handleCheckbox('status', key)} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cherry-600 focus:ring-cherry-500 cursor-pointer accent-cherry-600" />
                                    <span className={`text-sm ${filters.status.includes(key) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
                                </label>
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* 2. РІК (Закритий за замовчуванням) */}
                    <FilterAccordion title="Рік завершення" isOpenDefault={false}>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Від" value={filters.yearFrom} onChange={(e) => setFilters({...filters, yearFrom: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-cherry-500 outline-none text-center placeholder-slate-600" />
                            <span className="text-slate-500">—</span>
                            <input type="number" placeholder="До" value={filters.yearTo} onChange={(e) => setFilters({...filters, yearTo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-cherry-500 outline-none text-center placeholder-slate-600" />
                        </div>
                    </FilterAccordion>

                    {/* 3. ЖАНРИ */}
                    <FilterAccordion title="Жанри" count={filters.genre_ids.length}>
                        <div className="flex flex-wrap gap-2">
                            {genres.map(g => (
                                <FilterTag key={g.id} label={g.name} isActive={filters.genre_ids.includes(String(g.id))} onClick={() => handleCheckbox('genre_ids', String(g.id))} />
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* 4. СТИЛІ */}
                    <FilterAccordion title="Стилі" count={filters.style_ids.length}>
                        <div className="flex flex-wrap gap-2">
                            {styles.map(s => (
                                <FilterTag key={s.id} label={s.name} isActive={filters.style_ids.includes(String(s.id))} onClick={() => handleCheckbox('style_ids', String(s.id))} colorClass="bg-blue-900/20 border-blue-900/50" />
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* 5. МАТЕРІАЛИ */}
                    <FilterAccordion title="Матеріали" count={filters.material_ids?.length || 0}>
                        <div className="flex flex-wrap gap-2">
                            {materials.map(m => (
                                <FilterTag key={m.id} label={m.name} isActive={filters.material_ids?.includes(String(m.id))} onClick={() => handleCheckbox('material_ids', String(m.id))} colorClass="bg-green-900/20 border-green-900/50" />
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* 6. ТЕГИ */}
                    <FilterAccordion title="Теги" count={filters.tag_ids?.length || 0}>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                                <FilterTag key={t.id} label={'#' + t.name} isActive={filters.tag_ids?.includes(String(t.id))} onClick={() => handleCheckbox('tag_ids', String(t.id))} colorClass="bg-purple-900/20 border-purple-900/50" />
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* 👇 КНОПКА ТУТ (Йде відразу за списком) */}
                    <div className="pt-8 pb-4">
                        <button 
                            onClick={onApply}
                            className="w-full bg-cherry-600 hover:bg-cherry-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-cherry-900/20 transition active:scale-95 uppercase tracking-wider text-sm"
                        >
                            ЗАСТОСУВАТИ ФІЛЬТРИ
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
};

export default FilterSidebar;