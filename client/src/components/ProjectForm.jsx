import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './ui/Input';
import Button from './ui/Button';
import DictSelect from './ui/DictSelect';
import MultiDictSelect from './ui/MultiDictSelect';
import FuzzyDateInput from './ui/FuzzyDateInput';

const ProjectForm = ({ initialData, onSubmit, title, isLoading }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', description: '', image: null,
        style_id: '', genre_id: '', material_ids: [], tag_ids: [],
        status: 'PLANNED',
        started: { year: new Date().getFullYear(), month: '', day: '' },
        finished: { year: '', month: '', day: '' },
        // Якщо передали initialData (редагування), перезапишемо це в useEffect
    });
    
    const [errors, setErrors] = useState({});

    // Заповнюємо форму, якщо це редагування
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev, // Зберігаємо дефолтні значення
                ...initialData, // Накладаємо дані з бази
                
                // Ще раз страхуємося з датами
                started: initialData.started || { year: '', month: '', day: '' },
                finished: initialData.finished || { year: '', month: '', day: '' }
            }));
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Валідація
    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Назва обов'язкова";
        
        // Валідація дат
        if (formData.status === 'FINISHED' || formData.status === 'DROPPED') {
            const startYear = parseInt(formData.started.year) || 0;
            const endYear = parseInt(formData.finished.year) || 0;
            if (endYear < startYear && endYear !== 0) {
                newErrors.finished = "Рік завершення раніше початку!";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(formData);
    };

    const STATUSES = {
        'PLANNED': '📅 Заплановано',
        'SKETCH': '✏️ Скетч',
        'IN_PROGRESS': '🚧 В процесі',
        'FINISHED': '✅ Завершено',
        'ON_HOLD': '⏸ На паузі',
        'DROPPED': '❌ Покинуто'
    };

    return (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-cherry-500">{title}</h1>
                <button 
                    type="button"
                    onClick={() => navigate(-1)} // Повернутися назад
                    className="text-slate-500 hover:text-white transition"
                >
                    ✕ Скасувати
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Назва + Статус */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Назва" 
                        value={formData.title} 
                        onChange={(e) => handleChange('title', e.target.value)} 
                        error={errors.title}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Статус</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 h-10.5"
                        >
                            {Object.entries(STATUSES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Дати */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <FuzzyDateInput 
                        label="Початок роботи" 
                        value={formData.started} 
                        onChange={(val) => handleChange('started', val)} 
                    />
                    
                    {(formData.status === 'FINISHED' || formData.status === 'DROPPED') && (
                        <div className="animate-fade-in">
                            <FuzzyDateInput 
                                label="Дата завершення" 
                                value={formData.finished} 
                                onChange={(val) => handleChange('finished', val)} 
                                error={errors.finished}
                            />
                        </div>
                    )}
                </div>

                {/* Характеристики */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DictSelect type="genres" label="Жанр" value={formData.genre_id} onChange={(v) => handleChange('genre_id', v)} />
                    <DictSelect type="styles" label="Стиль" value={formData.style_id} onChange={(v) => handleChange('style_id', v)} />
                </div>

                <div className="space-y-4">
                    <MultiDictSelect type="materials" label="Матеріали" selectedIds={formData.material_ids} onChange={(ids) => handleChange('material_ids', ids)} />
                    <MultiDictSelect type="tags" label="Теги" selectedIds={formData.tag_ids} onChange={(ids) => handleChange('tag_ids', ids)} />
                </div>

                <Input label="Опис" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                
                {/* Фото */}
                <div className="border border-slate-700 border-dashed rounded-lg p-4 text-center hover:bg-slate-800/50 transition cursor-pointer relative">
                    <input 
                        type="file" 
                        onChange={(e) => handleChange('image', e.target.files[0])} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-slate-400 text-sm">
                        {formData.image ? (
                            <span className="text-green-400">Фото обрано: {formData.image.name}</span>
                        ) : (
                            "+ Натисни, щоб додати фото"
                        )}
                    </div>
                </div>

                <Button 
                    text={isLoading ? "Збереження..." : "Зберегти проєкт"} 
                    className="bg-cherry-700 w-full py-3 text-lg font-bold shadow-lg shadow-cherry-900/20 hover:scale-[1.01] transition-transform" 
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

export default ProjectForm;