import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    TrashIcon, ArrowLongLeftIcon, Bars2Icon, PhotoIcon, 
    ArrowPathIcon, CheckCircleIcon, GlobeAltIcon, LockClosedIcon 
} from '@heroicons/react/24/outline';
import collectionService from '../services/collectionService';
import artworkService from '../services/artworkService';

import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';

// 👇 ІМПОРТ ДЕФОЛТНОГО ФОТО
import defaultCollectionImg from '../assets/default-collection.png'; 

const CollectionEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Дані
    const [collection, setCollection] = useState(null);
    const [items, setItems] = useState([]);
    // 👇 Додали is_public в стейт
    const [meta, setMeta] = useState({ title: '', description: '', is_public: false });
    
    // Стан обкладинки
    const [pendingCoverFile, setPendingCoverFile] = useState(null); 
    const [previewCoverUrl, setPreviewCoverUrl] = useState(null); 
    const [shouldDeleteCover, setShouldDeleteCover] = useState(false); 

    // UI
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    useEffect(() => { loadData(); }, [id]);

    useEffect(() => {
        return () => {
            if (previewCoverUrl) URL.revokeObjectURL(previewCoverUrl);
        };
    }, [previewCoverUrl]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await collectionService.getById(id);
            setCollection(data);
            // 👇 Заповнюємо is_public з бази (конвертуємо 1/0 в true/false)
            setMeta({ 
                title: data.title, 
                description: data.description, 
                is_public: Boolean(data.is_public) 
            });
            setItems(data.items || []);
            setHasChanges(false);
            setShouldDeleteCover(false);
            setPendingCoverFile(null);
            setPreviewCoverUrl(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMetaChange = (field, value) => {
        setMeta(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
        setHasChanges(true);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setHasChanges(true);
        }
    };

    const handleCoverSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setPendingCoverFile(file);
        setPreviewCoverUrl(objectUrl);
        setShouldDeleteCover(false);
        setHasChanges(true);
    };

    const markCoverForDeletion = () => {
        setShouldDeleteCover(true);
        setPendingCoverFile(null);
        setPreviewCoverUrl(null);
        setHasChanges(true);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            const itemsToSave = items.map((item, idx) => ({
                id: item.link_id,
                sort_order: idx,
                layout_type: item.layout_type,
                context_description: item.context_description
            }));

            // 👇 meta тепер містить is_public
            await collectionService.saveAll(id, meta, itemsToSave);

            if (shouldDeleteCover) {
                await collectionService.deleteCover(id);
            } else if (pendingCoverFile) {
                await collectionService.uploadCover(id, pendingCoverFile);
            }

            setHasChanges(false);
            navigate(`/collections/${id}`);
            
        } catch (error) {
            console.error(error);
            alert("Помилка збереження.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (artworkId) => {
        if(!window.confirm("Прибрати з колекції?")) return;
        await collectionService.removeItem(id, artworkId);
        setItems(prev => prev.filter(i => i.artwork_id !== artworkId)); 
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Завантаження...</div>;

    // --- ЛОГІКА ВІДОБРАЖЕННЯ ОБКЛАДИНКИ ---
    let displayCoverSrc = defaultCollectionImg; // 👈 1. Спочатку ставимо дефолтну
    let isDefault = true;

    if (previewCoverUrl) {
        displayCoverSrc = previewCoverUrl;
        isDefault = false;
    } else if (shouldDeleteCover) {
        // Якщо видаляємо кастомну, перевіряємо, чи є роботи всередині
        if (items.length > 0) {
            displayCoverSrc = artworkService.getImageUrl(items[0].image_path);
        } else {
            displayCoverSrc = defaultCollectionImg;
        }
    } else if (collection.cover_image) {
        displayCoverSrc = artworkService.getImageUrl(collection.cover_image);
        isDefault = false;
    } else if (items.length > 0) {
        // Якщо немає своєї обкладинки, беремо першу роботу
        displayCoverSrc = artworkService.getImageUrl(items[0].image_path);
    } 
    // Якщо нічого немає, залишається defaultCollectionImg

    return (
        <div className="min-h-screen pb-40 p-4 md:p-8 max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="sticky top-4 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex justify-between items-center mb-8 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Link to={`/collections/${id}`} className="text-slate-400 hover:text-white transition">
                        <ArrowLongLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white hidden sm:block">
                        Редагування: <span className="text-cherry-500">{collection.title}</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    {hasChanges && <span className="text-xs text-yellow-500 flex items-center animate-pulse font-bold">● Є зміни</span>}
                    <button 
                        onClick={saveAll} 
                        disabled={!hasChanges || saving}
                        className={`
                            px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2
                            ${hasChanges ? 'bg-cherry-600 hover:bg-cherry-500 text-white shadow-lg shadow-cherry-900/40' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                        `}
                    >
                        {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                        {saving ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ЛІВА КОЛОНКА */}
                <div className="space-y-6">
                    
                    {/* 👇 БЛОК ПУБЛІЧНОСТІ */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Доступ</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleMetaChange('is_public', false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold border transition ${!meta.is_public ? 'bg-slate-800 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'}`}
                            >
                                <LockClosedIcon className="w-4 h-4" /> Приватна
                            </button>
                            <button
                                onClick={() => handleMetaChange('is_public', true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold border transition ${meta.is_public ? 'bg-green-900/30 text-green-400 border-green-900' : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'}`}
                            >
                                <GlobeAltIcon className="w-4 h-4" /> Публічна
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                            {meta.is_public 
                                ? 'Колекцію зможуть бачити всі, у кого є посилання або через ваш профіль.' 
                                : 'Колекцію бачите тільки ви.'}
                        </p>
                    </div>

                    {/* Обкладинка */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Обкладинка</h3>
                        
                        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative mb-4 group">
                            <img src={displayCoverSrc} className="w-full h-full object-cover" alt="Cover" />
                        </div>
                        
                        <div className="flex gap-2">
                             <button 
                                onClick={() => fileInputRef.current.click()}
                                className="flex-1 bg-slate-800 text-slate-200 text-xs font-bold py-2 rounded hover:bg-slate-700 border border-slate-700"
                            >
                                {previewCoverUrl || (!isDefault && collection.cover_image) ? 'Змінити фото' : 'Завантажити своє'}
                            </button>
                            
                            {(!isDefault || previewCoverUrl) && (
                                <button 
                                    onClick={markCoverForDeletion}
                                    className="bg-red-950 text-red-500 text-xs font-bold px-3 py-2 rounded hover:bg-red-900 border border-red-900/30"
                                    title="Скинути до стандартного"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleCoverSelect} className="hidden" />
                    </div>

                    {/* Метадані */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Інфо</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1 uppercase">Назва</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black border border-slate-800 rounded p-2 text-white text-sm focus:border-cherry-500 outline-none transition"
                                    value={meta.title}
                                    onChange={(e) => handleMetaChange('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1 uppercase">Опис</label>
                                <textarea 
                                    className="w-full bg-black border border-slate-800 rounded p-2 text-white text-sm focus:border-cherry-500 outline-none transition h-32 resize-none"
                                    value={meta.description}
                                    onChange={(e) => handleMetaChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ПРАВА КОЛОНКА (Сортувалка) залишається майже без змін, лише відображення */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Роботи ({items.length})</h3>
                        <span className="text-xs text-slate-500">Тягніть за <Bars2Icon className="w-3 h-3 inline"/> щоб змінити порядок</span>
                    </div>

                    {/* DndContext і SortableContext залишаються як були */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 relative group hover:border-cherry-900/30 transition">
                                            {/* Ручка Drag */}
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 cursor-grab active:cursor-grabbing sm:block hidden hover:text-white p-2">
                                                <Bars2Icon className="w-6 h-6" />
                                            </div>

                                            {/* Картинка */}
                                            <div className="w-full sm:w-24 h-24 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-700 sm:ml-8 pointer-events-none">
                                                <img src={artworkService.getImageUrl(item.image_path)} className="w-full h-full object-cover" alt="" />
                                            </div>

                                            {/* Контент Item */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white truncate pr-2">{item.title}</h4>
                                                    <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleDeleteItem(item.artwork_id)} className="text-slate-600 hover:text-red-500 transition">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {/* Поля для виставки... */}
                                                {collection.type === 'EXHIBITION' && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" onPointerDown={(e) => e.stopPropagation()}>
                                                        <div>
                                                            <label className="block text-[9px] text-slate-500 uppercase mb-1">Вигляд</label>
                                                            <div className="relative">
                                                                <select className="w-full bg-black border border-slate-700 text-slate-300 text-xs p-1.5 rounded outline-none" value={item.layout_type || 'CENTER'} onChange={(e) => handleItemChange(index, 'layout_type', e.target.value)}>
                                                                    <option value="CENTER">По центру</option>
                                                                    <option value="LEFT_TEXT">Фото зліва</option>
                                                                    <option value="RIGHT_TEXT">Фото справа</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-[9px] text-slate-500 uppercase mb-1">Текст</label>
                                                            <input type="text" className="w-full bg-black border border-slate-700 text-slate-300 text-xs p-1.5 rounded outline-none" placeholder="..." value={item.context_description || ''} onChange={(e) => handleItemChange(index, 'context_description', e.target.value)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </SortableItem>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <div className="mt-20 pt-10 border-t border-red-900/20 text-center">
                <button onClick={async () => { if(window.confirm('Видалити всю колекцію назавжди?')) { await collectionService.delete(id); navigate('/collections'); }}} className="text-red-900 hover:text-red-500 text-xs uppercase tracking-widest font-bold transition opacity-60 hover:opacity-100">
                    Видалити колекцію
                </button>
            </div>
        </div>
    );
};

export default CollectionEditPage;