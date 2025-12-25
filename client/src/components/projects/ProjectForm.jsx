import { useState, useEffect, useRef } from 'react';
import { PhotoIcon, CloudArrowUpIcon, TrashIcon, BookmarkSquareIcon } from '@heroicons/react/24/outline';

import Input from '../ui/Input';
import DictSelect from '../ui/DictSelect';
import MultiDictSelect from '../ui/MultiDictSelect';
import FuzzyDateInput from '../ui/FuzzyDateInput';
import EditorLayout from '../layouts/EditorLayout';
import ConfirmModal from '../shared/ConfirmModal'; // 👈 Імпорт модалки
import artworkService from '../../services/artworkService';
import { ART_STATUSES } from '../../config/constants';

const getToday = () => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

const isFutureDate = (d) => {
    if (!d || !d.year) return false;
    const now = new Date();
    const checkDate = new Date(d.year, (d.month || 1) - 1, d.day || 1);
    now.setHours(0, 0, 0, 0);
    return checkDate > now;
};

const ProjectForm = ({ initialData, onSubmit, title, isLoading, onDelete, gallery = [] }) => {
    const fileInputRef = useRef(null);
    const isCreateMode = !initialData;

    const [formData, setFormData] = useState({
        title: '', description: '',
        style_id: '', genre_id: '', material_ids: [], tag_ids: [],
        status: 'PLANNED',
        started: initialData?.started || getToday(),
        finished: { year: '', month: '', day: '' },
        image_path: '' 
    });
    
    const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [pendingFile, setPendingFile] = useState(null); 
    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState({});

    // Стейт для модалок
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev, ...initialData,
                image_path: initialData.image_path || '',
                started: initialData.started || prev.started,
                finished: initialData.finished || prev.finished,
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (['FINISHED', 'DROPPED'].includes(formData.status)) {
            if (!formData.finished.year) {
                setFormData(prev => ({ ...prev, finished: getToday() }));
                setHasChanges(true);
            }
        }
    }, [formData.status]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
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

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (isFutureDate(formData.started)) newErrors.started = "Cannot start in the future";
        if (['FINISHED', 'DROPPED'].includes(formData.status) && isFutureDate(formData.finished)) {
            newErrors.finished = "Cannot finish in the future";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({ ...formData, image: pendingFile }, deletedGalleryIds);
    };

    // --- ЛОГІКА МОДАЛОК ---
    
    // 1. Відкрити модалку видалення ФОТО
    const openDeletePhotoModal = (imgId) => {
        setModalConfig({
            isOpen: true,
            type: 'DELETE_PHOTO',
            data: imgId,
            title: "Erase Memory?",
            message: "This image will be marked for deletion. It will vanish completely when you Save changes.",
            confirmText: "Erase"
        });
    };

    // 2. Відкрити модалку видалення ПРОЄКТУ
    const openDeleteProjectModal = () => {
        setModalConfig({
            isOpen: true,
            type: 'DELETE_PROJECT',
            title: "Destroy Creation?",
            message: "This grimoire page will be burned. This action cannot be undone.",
            confirmText: "Burn It"
        });
    };

    // 3. Підтвердження дії
    const handleConfirmModal = () => {
        if (modalConfig.type === 'DELETE_PHOTO') {
            setDeletedGalleryIds(prev => [...prev, modalConfig.data]);
            setHasChanges(true);
        } else if (modalConfig.type === 'DELETE_PROJECT') {
            onDelete();
        }
        setModalConfig({ isOpen: false, type: null, data: null });
    };

    const displayImageSrc = previewUrl || artworkService.getImageUrl(formData.image_path);

    let rawGallery = [...gallery];
    if (initialData?.image_path) {
        if (!rawGallery.some(img => img.image_path === initialData.image_path)) {
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
                <button 
                    onClick={openDeleteProjectModal} // 👈 Відкриваємо модалку
                    className="text-blood/40 hover:text-blood text-[10px] uppercase tracking-[0.3em] font-bold transition-all font-mono"
                >
                    Destroy this Creation
                </button>
            )}
        >
            {/* ... ЛІВА КОЛОНКА (без змін) ... */}
            <div className="space-y-6 lg:col-span-1 font-mono">
                <div className="bg-ash border border-border p-6 rounded-sm space-y-5 shadow-xl">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-2 border-b border-border pb-2">Codex Details</h3>
                    <Input label="Project Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} placeholder="Untitled..."/>
                    {!isCreateMode && (
                        <div>
                            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Status</label>
                            <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full bg-void border border-border rounded-sm p-2.5 text-bone text-sm outline-none focus:border-blood transition-colors appearance-none cursor-pointer">
                                {Object.entries(ART_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                        </div>
                    )}
                    <FuzzyDateInput label="Genesis Date" value={formData.started} onChange={(val) => handleChange('started', val)} error={errors.started}/>
                    {(formData.status === 'FINISHED' || formData.status === 'DROPPED') && <FuzzyDateInput label="Conclusion Date" value={formData.finished} onChange={(val) => handleChange('finished', val)} error={errors.finished}/>}
                    <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">History / Lore</label>
                        <textarea className="w-full bg-void border border-border p-3 text-bone text-sm rounded-sm focus:border-blood outline-none transition h-32 resize-none placeholder-muted/20" value={formData.description} placeholder="Tell the story of this art..." onChange={(e) => handleChange('description', e.target.value)}/>
                    </div>
                </div>
                <div className="bg-ash border border-border p-6 rounded-sm space-y-5 shadow-xl">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-2 border-b border-border pb-2">Attributes</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <DictSelect type="genres" label="Genre" value={formData.genre_id} onChange={(v) => handleChange('genre_id', v)} />
                        <DictSelect type="styles" label="Style" value={formData.style_id} onChange={(v) => handleChange('style_id', v)} />
                    </div>
                    <MultiDictSelect type="materials" label="Materials" selectedIds={formData.material_ids} onChange={(ids) => handleChange('material_ids', ids)} />
                    <MultiDictSelect type="tags" label="Tags" selectedIds={formData.tag_ids} onChange={(ids) => handleChange('tag_ids', ids)} />
                </div>
            </div>

            {/* ПРАВА КОЛОНКА (без змін, тільки кнопка видалення фото) */}
            <div className="lg:col-span-2 space-y-6 font-mono">
                <div className="bg-ash border border-border p-6 rounded-sm shadow-xl">
                    <header className="flex justify-between items-center mb-6 border-b border-border pb-2">
                        <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Main Grimoire Cover</h3>
                        {initialData && formData.image_path !== initialData.image_path && !previewUrl && (
                            <span className="text-blood text-[9px] animate-pulse uppercase tracking-tighter">● Selected from history</span>
                        )}
                    </header>
                    <div className="aspect-video bg-void rounded-sm overflow-hidden border border-border flex items-center justify-center mb-6 group relative">
                        {displayImageSrc ? (
                            <img src={displayImageSrc} className="w-full h-full object-contain" alt="Preview" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted/20">
                                <PhotoIcon className="w-20 h-20 mb-2" />
                                <span className="text-[10px] uppercase tracking-[0.3em]">No Visual Sacrifice</span>
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full bg-void hover:bg-ash border border-border text-muted hover:text-blood py-4 rounded-sm font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-300">
                        <CloudArrowUpIcon className="w-5 h-5"/> Upload New Vision
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                </div>

                {initialData && (
                    <div className="bg-ash border border-border rounded-sm p-6 shadow-2xl">
                        <header className="flex items-center gap-3 mb-6 border-b border-border pb-2">
                             <h3 className="text-[10px] text-blood font-bold uppercase tracking-[0.2em]">Visual History</h3>
                             <span className="text-muted/40 text-[10px]">({visibleGallery.length})</span>
                        </header>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {visibleGallery.length === 0 ? (
                                <p className="text-muted/30 text-[10px] text-center py-10 uppercase tracking-widest">The archives are empty</p>
                            ) : (
                                visibleGallery.map(img => {
                                    const isSelected = img.image_path === formData.image_path;
                                    return (
                                        <div key={img.id} className={`group relative bg-void border rounded-sm overflow-hidden transition-all duration-300 ${isSelected ? 'border-blood scale-[0.98]' : 'border-border'}`}>
                                            <div className="aspect-square relative">
                                                <img src={artworkService.getImageUrl(img.image_path)} className="absolute inset-0 w-full h-full object-cover" alt=""/>
                                                {isSelected && <div className="absolute inset-0 bg-blood/10 backdrop-blur-[1px] flex items-center justify-center"><BookmarkSquareIcon className="w-8 h-8 text-blood drop-shadow-lg" /></div>}
                                            </div>
                                            <div className="w-full p-2 flex gap-2 bg-black/90 border-t border-border/50">
                                                {!isSelected ? (
                                                    <button type="button" onClick={() => handleSelectFromGallery(img.image_path)} className="flex-1 bg-blood/20 text-blood border border-blood/50 py-1.5 text-[9px] font-bold uppercase tracking-tighter hover:bg-blood hover:text-white transition-colors rounded-sm">Invoke</button>
                                                ) : (
                                                    <div className="flex-1 text-center py-1.5 text-[9px] font-bold text-blood tracking-tighter uppercase border border-transparent">Active Cover</div>
                                                )}
                                                {!isSelected && !img.isVirtual && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => openDeletePhotoModal(img.id)} // 👈 ВІДКРИВАЄМО МОДАЛКУ ФОТО
                                                        className="px-2 bg-void text-muted hover:text-blood border border-border hover:border-blood transition-colors rounded-sm"
                                                    >
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 👇 МОДАЛКА (ЄДИНА ДЛЯ ВСІХ ДІЙ) */}
            <ConfirmModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmModal}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
            />
        </EditorLayout>
    );
};

export default ProjectForm;