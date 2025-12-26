import { useState, useEffect } from 'react';
import { XMarkIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import FilterAccordion from '../ui/FilterAccordion';
import FilterMultiSelect from '../ui/FilterMultiSelect';
import dictionaryService from '../../services/dictionaryService';
import { ART_STATUSES } from '../../config/constants';

const FilterSidebar = ({ isOpen, onClose, filters, setFilters, onApply, onReset }) => {
    const [dicts, setDicts] = useState({
        genres: [],
        styles: [],
        materials: [],
        tags: []
    });

    useEffect(() => {
        const loadDicts = async () => {
            try {
                const [g, s, m, t] = await Promise.all([
                    dictionaryService.getAll('genres'),
                    dictionaryService.getAll('styles'),
                    dictionaryService.getAll('materials'),
                    dictionaryService.getAll('tags')
                ]);
                setDicts({ genres: g || [], styles: s || [], materials: m || [], tags: t || [] });
            } catch (e) { console.error("Error loading dictionaries:", e); }
        };
        loadDicts();
    }, []);

    const handleStatusToggle = (value) => {
        const list = filters.status || [];
        const newList = list.includes(value) 
            ? list.filter(item => item !== value) 
            : [...list, value];
        setFilters({ ...filters, status: newList });
    };

    const handleDictChange = (field, newIds) => {
        setFilters({ ...filters, [field]: newIds });
    };

    return (
        <>
            {/* Backdrop (Mobile Only) */}
            <div 
                className={`
                    fixed inset-0 bg-black/90 backdrop-blur-sm z-[40] transition-opacity duration-300 md:hidden
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* SIDEBAR */}
            <aside className={`
                fixed top-0 right-0 h-full w-80 bg-deep z-[50] flex flex-col font-mono
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                md:absolute md:right-0 md:h-full
                
                /* Borders: All sides including right */
                border border-border shadow-none
                
                /* Rounding: Top-left and Bottom-left corners only */
                md:rounded-l-lg overflow-hidden
            `}>
                
                {/* HEADER */}
                <div className="p-5 border-b border-border bg-void shrink-0 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-gothic text-xl text-bone tracking-widest flex items-center gap-3">
                            <FunnelIcon className="w-5 h-5 text-blood" />
                            Filters
                        </h2>
                        <button onClick={onClose} className="md:hidden text-muted hover:text-white transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={onApply}
                            className="flex-1 bg-blood hover:bg-blood-hover text-white font-bold py-3 rounded-sm shadow-inner transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                        >
                            Apply
                        </button>
                        
                        <button 
                            onClick={onReset}
                            className="w-12 bg-ash border border-border hover:border-blood text-muted hover:text-white flex items-center justify-center rounded-sm transition-colors group"
                            title="Reset All"
                        >
                            <ArrowPathIcon className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-ash/10">
                    
                    {/* STATUS */}
                    <FilterAccordion title="Status" count={filters.status.length} isOpenDefault={true}>
                        <div className="space-y-1 pt-2">
                            {Object.entries(ART_STATUSES).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-void rounded-sm transition-colors">
                                    <div className={`
                                        w-3.5 h-3.5 border flex items-center justify-center rounded-[2px] transition-colors shrink-0
                                        ${filters.status.includes(key) ? 'bg-blood border-blood' : 'bg-transparent border-muted group-hover:border-bone'}
                                    `}>
                                        {filters.status.includes(key) && <span className="text-white text-[8px] font-bold">✓</span>}
                                    </div>
                                    <span className={`text-xs uppercase tracking-wider ${filters.status.includes(key) ? 'text-bone font-bold' : 'text-muted group-hover:text-bone'}`}>
                                        {label}
                                    </span>
                                    <input type="checkbox" className="hidden" checked={filters.status.includes(key)} onChange={() => handleStatusToggle(key)} />
                                </label>
                            ))}
                        </div>
                    </FilterAccordion>

                    {/* YEAR */}
                    <FilterAccordion title="Year Range">
                        <div className="flex items-center gap-3 pt-2 pb-2">
                            <input 
                                type="number" 
                                placeholder="From" 
                                value={filters.yearFrom} 
                                onChange={(e) => setFilters({...filters, yearFrom: e.target.value})} 
                                className="w-full bg-void border border-border rounded-sm p-2 text-xs text-bone focus:border-blood outline-none text-center placeholder-muted" 
                            />
                            <span className="text-muted text-xs">—</span>
                            <input 
                                type="number" 
                                placeholder="To" 
                                value={filters.yearTo} 
                                onChange={(e) => setFilters({...filters, yearTo: e.target.value})} 
                                className="w-full bg-void border border-border rounded-sm p-2 text-xs text-bone focus:border-blood outline-none text-center placeholder-muted" 
                            />
                        </div>
                    </FilterAccordion>

                    {/* LISTS */}
                    <FilterAccordion title="Genres" count={filters.genre_ids.length}>
                        <FilterMultiSelect 
                            options={dicts.genres} 
                            selectedIds={filters.genre_ids} 
                            onChange={(ids) => handleDictChange('genre_ids', ids)}
                            placeholder="Select genres..."
                        />
                    </FilterAccordion>

                    <FilterAccordion title="Styles" count={filters.style_ids.length}>
                        <FilterMultiSelect 
                            options={dicts.styles} 
                            selectedIds={filters.style_ids} 
                            onChange={(ids) => handleDictChange('style_ids', ids)}
                            placeholder="Select styles..."
                        />
                    </FilterAccordion>

                    <FilterAccordion title="Materials" count={filters.material_ids?.length || 0}>
                        <FilterMultiSelect 
                            options={dicts.materials} 
                            selectedIds={filters.material_ids} 
                            onChange={(ids) => handleDictChange('material_ids', ids)}
                            placeholder="Select materials..."
                        />
                    </FilterAccordion>

                    <FilterAccordion title="Tags" count={filters.tag_ids?.length || 0}>
                        <FilterMultiSelect 
                            options={dicts.tags} 
                            selectedIds={filters.tag_ids} 
                            onChange={(ids) => handleDictChange('tag_ids', ids)}
                            placeholder="Select tags..."
                        />
                    </FilterAccordion>

                </div>
            </aside>
        </>
    );
};

export default FilterSidebar;