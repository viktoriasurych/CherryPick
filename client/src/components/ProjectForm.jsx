import { useState, useEffect, useRef } from 'react';
import { PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Input from './ui/Input';
import DictSelect from './ui/DictSelect';
import MultiDictSelect from './ui/MultiDictSelect';
import FuzzyDateInput from './ui/FuzzyDateInput';
import EditorLayout from './EditorLayout';
import artworkService from '../services/artworkService';

// 👇 1. HELPER: Отримати сьогоднішню дату
const getToday = () => {
    const now = new Date();
    return { 
        year: now.getFullYear(), 
        month: now.getMonth() + 1, 
        day: now.getDate() 
    };
};

// 👇 2. HELPER: Перевірка на майбутнє
const isFutureDate = (d) => {
    if (!d || !d.year) return false;
    const now = new Date();
    // Створюємо дату. Якщо місяць/день не вказані, беремо 1 (початок періоду)
    // Місяці в JS від 0 до 11, тому віднімаємо 1
    const checkDate = new Date(d.year, (d.month || 1) - 1, d.day || 1);
    
    // Скидаємо час у "зараз" на 00:00:00 для коректного порівняння дат
    now.setHours(0, 0, 0, 0);
    
    return checkDate > now;
};

const ProjectForm = ({ 
    initialData, 
    onSubmit, 
    title, 
    isLoading, 
    onDelete,
    gallery = [] 
}) => {
    const fileInputRef = useRef(null);
    
    // Визначаємо, чи це створення нової роботи
    const isCreateMode = !initialData;

    // --- STATE ---
    const [formData, setFormData] = useState({
        title: '', description: '',
        style_id: '', genre_id: '', material_ids: [], tag_ids: [],
        status: 'PLANNED',
        // 👇 3. При створенні ставимо СЬОГОДНІ, при редагуванні - те що було
        started: initialData?.started || getToday(),
        finished: { year: '', month: '', day: '' },
        image_path: '' 
    });
    
    const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [pendingFile, setPendingFile] = useState(null); 
    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState({});

    // Завантаження даних при редагуванні
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                image_path: initialData.image_path || '',
                started: initialData.started || prev.started, // Якщо в базі пусто, залишаємо те, що було (today)
                finished: initialData.finished || prev.finished,
            }));
        }
    }, [initialData]);

    // 👇 4. АВТО-ДАТА ЗАВЕРШЕННЯ
    // Якщо статус змінився на "Завершено" або "Покинуто", і дата пуста -> ставимо сьогодні
    useEffect(() => {
        if (['FINISHED', 'DROPPED'].includes(formData.status)) {
            if (!formData.finished.year) {
                setFormData(prev => ({ ...prev, finished: getToday() }));
                setHasChanges(true); // Щоб кнопка зберегти активувалась
            }
        }
    }, [formData.status]);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    // --- HANDLERS ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Якщо змінили статус на щось активне, можна очистити дату завершення (опціонально)
        if (field === 'status' && !['FINISHED', 'DROPPED'].includes(value)) {
             // Можна розкоментувати, якщо хочеш очищати дату при поверненні в роботу
             // setFormData(prev => ({ ...prev, finished: { year: '', month: '', day: '' } }));
        }
        setHasChanges(true);
        // Очищаємо помилки при зміні
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, image_path: '' }));
        setHasChanges(true);
    };

    const handleSelectFromGallery = (path) => {
        setPendingFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData(prev => ({ ...prev, image_path: path }));
        setHasChanges(true);
    };

    const handleQueueDelete = (imgId) => {
        if (!window.confirm("Видалити це фото? (Дія застосується після натискання 'Зберегти')")) return;
        setDeletedGalleryIds(prev => [...prev, imgId]);
        setHasChanges(true);
    };

    // --- SUBMIT & VALIDATION ---
    const handleSubmit = () => {
        const newErrors = {};

        // 1. Валідація назви
        if (!formData.title.trim()) {
            newErrors.title = "Назва обов'язкова";
        }

        // 2. 👇 Валідація дат (Майбутнє)
        if (isFutureDate(formData.started)) {
            newErrors.started = "Дата початку не може бути в майбутньому";
        }
        if (['FINISHED', 'DROPPED'].includes(formData.status) && isFutureDate(formData.finished)) {
            newErrors.finished = "Дата завершення не може бути в майбутньому";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Перевірте введені дані (дати не можуть бути в майбутньому)");
            return;
        }

        onSubmit(
            { ...formData, image: pendingFile }, 
            deletedGalleryIds
        );
    };

    // --- RENDER HELPERS ---
    const displayImageSrc = previewUrl || artworkService.getImageUrl(formData.image_path);
    const STATUSES = {
        'PLANNED': '📅 Заплановано', 'SKETCH': '✏️ Скетч',
        'IN_PROGRESS': '🚧 В процесі', 'FINISHED': '✅ Завершено',
        'ON_HOLD': '⏸ На паузі', 'DROPPED': '❌ Покинуто'
    };

    // Галерея (фільтрація видалених)
    let rawGallery = [...gallery];
    if (initialData?.image_path) {
        const isCoverInGallery = rawGallery.some(img => img.image_path === initialData.image_path);
        if (!isCoverInGallery) {
            rawGallery.unshift({ id: 'virtual_cover', image_path: initialData.image_path, isVirtual: true });
        }
    }
    const visibleGallery = rawGallery.filter(img => !deletedGalleryIds.includes(img.id));

    return (
        <EditorLayout
            title={title}
            backLink="/projects"
            isSaving={isLoading}
            hasChanges={hasChanges}
            onSave={handleSubmit}
            actions={onDelete && (
                <button onClick={onDelete} className="text-red-900 hover:text-red-500 text-xs uppercase tracking-widest font-bold transition opacity-60 hover:opacity-100">
                    Видалити проєкт
                </button>
            )}
        >
            {/* === ЛІВА КОЛОНКА === */}
            <div className="space-y-6 lg:col-span-1">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Деталі</h3>
                    
                    <Input 
                        label="Назва" 
                        value={formData.title} 
                        onChange={(e) => handleChange('title', e.target.value)} 
                        error={errors.title} 
                    />
                    
                    <div>
                         <label className="block text-[10px] text-slate-500 uppercase mb-1">Опис / Історія</label>
                         <textarea 
                            className="w-full bg-black border border-slate-800 rounded p-3 text-slate-300 text-sm focus:border-cherry-500 outline-none transition h-32 resize-none"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                         />
                    </div>

                    {/* 👇 5. ХОВАЄМО СТАТУС ПРИ СТВОРЕННІ */}
                    {!isCreateMode && (
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Статус</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full bg-black border border-slate-800 rounded p-2 text-white text-sm outline-none focus:border-cherry-500"
                            >
                                {Object.entries(STATUSES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="relative">
                        <FuzzyDateInput 
                            label="Початок" 
                            value={formData.started} 
                            onChange={(val) => handleChange('started', val)} 
                        />
                        {errors.started && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.started}</p>}
                    </div>

                    {(formData.status === 'FINISHED' || formData.status === 'DROPPED') && (
                        <div className="animate-fade-in relative">
                            <FuzzyDateInput 
                                label="Завершення" 
                                value={formData.finished} 
                                onChange={(val) => handleChange('finished', val)} 
                            />
                            {errors.finished && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.finished}</p>}
                        </div>
                    )}
                </div>

                 <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Атрибути</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <DictSelect type="genres" label="Жанр" value={formData.genre_id} onChange={(v) => handleChange('genre_id', v)} />
                        <DictSelect type="styles" label="Стиль" value={formData.style_id} onChange={(v) => handleChange('style_id', v)} />
                    </div>
                    <MultiDictSelect type="materials" label="Матеріали" selectedIds={formData.material_ids} onChange={(ids) => handleChange('material_ids', ids)} />
                    <MultiDictSelect type="tags" label="Теги" selectedIds={formData.tag_ids} onChange={(ids) => handleChange('tag_ids', ids)} />
                 </div>
            </div>

            {/* === ПРАВА КОЛОНКА (Фото) === */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* БЛОК ОБКЛАДИНКИ */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex justify-between items-center">
                        <span>{previewUrl ? 'Новий файл (не збережено)' : 'Головна обкладинка'}</span>
                        {formData.image_path !== initialData?.image_path && !previewUrl && (
                            <span className="text-yellow-500 text-[10px] animate-pulse">● Обрано з галереї</span>
                        )}
                    </h3>

                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center mb-4">
                        {displayImageSrc ? (
                            <img src={displayImageSrc} className="w-full h-full object-contain" alt="Preview" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-600">
                                <PhotoIcon className="w-16 h-16 mb-2 opacity-30" />
                                <span className="text-xs uppercase font-bold opacity-50">Немає фото</span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition"
                    >
                        <CloudArrowUpIcon className="w-5 h-5 text-cherry-500"/>
                        Завантажити нове фото
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                </div>

                {/* ГАЛЕРЕЯ (Тільки якщо є initialData, тобто редагування) */}
                {initialData && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl">
                        <div className="mb-4 flex items-center gap-2">
                             <h3 className="text-lg text-cherry-500 font-bold">📸 Галерея</h3>
                             <span className="text-slate-600 text-xs">({visibleGallery.length})</span>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {visibleGallery.length === 0 ? (
                                <p className="text-slate-500 text-xs text-center py-4">Тут будуть ваші старі обкладинки</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {visibleGallery.map(img => {
                                        const isSelectedAsCover = img.image_path === formData.image_path;
                                        return (
                                            <div key={img.id} className={`bg-black rounded-lg border overflow-hidden flex flex-col shadow-lg transition-all ${isSelectedAsCover ? 'border-green-500 ring-1 ring-green-500 scale-[1.02]' : 'border-slate-700 hover:border-slate-500'}`}>
                                                <div className="aspect-square relative w-full border-b border-slate-800">
                                                    <img src={artworkService.getImageUrl(img.image_path)} className="absolute inset-0 w-full h-full object-cover"/>
                                                    {isSelectedAsCover && (
                                                        <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">Обрано</div>
                                                    )}
                                                </div>
                                                <div className="p-2 bg-slate-900 flex justify-between items-center gap-2">
                                                    {isSelectedAsCover ? (
                                                        <div className="flex-1 text-center py-2 text-xs font-bold text-green-400 bg-green-900/20 rounded border border-green-900/50 cursor-default">★ Обкладинка</div>
                                                    ) : (
                                                        <button type="button" onClick={() => handleSelectFromGallery(img.image_path)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700"><span>★</span> Обрати</button>
                                                    )}
                                                    {!isSelectedAsCover && !img.isVirtual && (
                                                        <button type="button" onClick={() => handleQueueDelete(img.id)} className="bg-slate-800 hover:bg-red-600 hover:text-white text-red-500 py-2 px-3 rounded font-bold transition border border-slate-700 hover:border-red-500">🗑</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </EditorLayout>
    );
};

export default ProjectForm;