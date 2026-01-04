import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    TrashIcon, Bars2Icon, LockClosedIcon, GlobeAltIcon
} from '@heroicons/react/24/outline';
import collectionService from '../../services/collectionService';
import artworkService from '../../services/artworkService';

import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { SortableItem } from '../../components/ui/SortableItem';
import EditorLayout from '../../components/layouts/EditorLayout';
import ConfirmModal from '../../components/shared/ConfirmModal';
import defaultCollectionImg from '../../assets/default-collection.png';

import Loader from '../../components/ui/Loader'; 
import PageTitle from '../../components/shared/PageTitle'; 
import Select from '../../components/ui/Select'; 

const CollectionEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [collection, setCollection] = useState(null);
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ title: '', description: '', is_public: false });

    const [pendingCoverFile, setPendingCoverFile] = useState(null); 
    const [previewCoverUrl, setPreviewCoverUrl] = useState(null); 
    const [shouldDeleteCover, setShouldDeleteCover] = useState(false); 

    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);          

    const [deleteCollectionModal, setDeleteCollectionModal] = useState(false);
    const [deleteItemModal, setDeleteItemModal] = useState({ isOpen: false, itemId: null });

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
            setIsLoadingData(true);
            const data = await collectionService.getById(id);
            setCollection(data);
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
            navigate('/collections');
        } finally {
            setIsLoadingData(false);
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
        setIsSaving(true);
        try {
            const itemsToSave = items.map((item, idx) => ({
                id: item.link_id,
                sort_order: idx,
                layout_type: item.layout_type,
                context_description: item.context_description
            }));

            await collectionService.saveAll(id, meta, itemsToSave);

            if (shouldDeleteCover) {
                await collectionService.deleteCover(id);
            } else if (pendingCoverFile) {
                await collectionService.uploadCover(id, pendingCoverFile);
            }

            setHasChanges(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Save Error");
        } finally {
            setIsSaving(false);
        }
    };

    const requestDeleteItem = (artworkId) => {
        setDeleteItemModal({ isOpen: true, itemId: artworkId });
    };

    const confirmDeleteItem = async () => {
        const artworkId = deleteItemModal.itemId;
        if (!artworkId) return;
        
        await collectionService.removeItem(id, artworkId);
        setItems(prev => prev.filter(i => i.artwork_id !== artworkId)); 
        setDeleteItemModal({ isOpen: false, itemId: null });
    };

    const confirmDeleteCollection = async () => {
        await collectionService.delete(id); 
        navigate('/collections'); 
    };

    if (isLoadingData) return <Loader />;
    if (!collection) return null;

    let displayCoverSrc = defaultCollectionImg;
    let isDefault = true;

    if (previewCoverUrl) {
        displayCoverSrc = previewCoverUrl;
        isDefault = false;
    } else if (shouldDeleteCover) {
        if (items.length > 0) displayCoverSrc = artworkService.getImageUrl(items[0].image_path);
    } else if (collection.cover_image) {
        displayCoverSrc = artworkService.getImageUrl(collection.cover_image);
        isDefault = false;
    } else if (items.length > 0) {
        displayCoverSrc = artworkService.getImageUrl(items[0].image_path);
    } 

    const layoutOptions = [
        { value: 'CENTER', label: 'Center' },
        { value: 'LEFT_TEXT', label: 'Text Left' },
        { value: 'RIGHT_TEXT', label: 'Text Right' },
    ];

    return (
        <>
            <PageTitle title={`Edit | ${collection.title}`} />

            <EditorLayout
                title={`Editing: ${collection.title}`}
                backLink={`/collections/${id}`}
                isSaving={isSaving}
                hasChanges={hasChanges}
                onSave={saveAll}
                actions={
                    <button 
                        onClick={() => setDeleteCollectionModal(true)} 
                        className="text-blood/40 hover:text-blood text-[10px] uppercase tracking-[0.3em] font-bold transition-all font-mono"
                    >
                        Destroy this Collection
                    </button>
                }
            >
                {/* налаштування ліве*/}
                <div className="space-y-6">
                    
                    {/* доступ приват публ */}
                    <div className="bg-void border border-border p-6 rounded-sm shadow-2xl shadow-black">
                        <h3 className="text-xs font-bold text-muted mb-4 uppercase tracking-[0.2em]">Access</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleMetaChange('is_public', false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-bold border transition-all uppercase tracking-wider ${!meta.is_public ? 'bg-blood/20 text-blood border-blood shadow-[0_0_10px_rgba(159,18,57,0.2)]' : 'bg-transparent text-muted border-border hover:border-muted hover:text-bone'}`}
                            >
                                <LockClosedIcon className="w-3 h-3" /> Private
                            </button>
                            <button
                                onClick={() => handleMetaChange('is_public', true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-bold border transition-all uppercase tracking-wider ${meta.is_public ? 'bg-blood/20 text-blood border-blood shadow-[0_0_10px_rgba(159,18,57,0.2)]' : 'bg-transparent text-muted border-border hover:border-muted hover:text-bone'}`}
                            >
                                <GlobeAltIcon className="w-3 h-3" /> Public
                            </button>
                        </div>
                        <p className="text-[10px] text-muted/50 mt-3 text-center leading-relaxed font-mono">
                            {meta.is_public ? 'Visible to anyone with the link.' : 'Visible only to you.'}
                        </p>
                    </div>

                    {/* обкладинка */}
                    <div className="bg-void border border-border p-6 rounded-sm shadow-2xl shadow-black">
                        <h3 className="text-xs font-bold text-muted mb-4 uppercase tracking-[0.2em]">Cover</h3>
                        <div className="aspect-video bg-black rounded-sm overflow-hidden border border-border relative mb-4 group">
                            <img src={displayCoverSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" alt="Cover" />
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-ash hover:bg-void text-bone text-[10px] font-bold py-2 rounded-sm border border-border hover:border-muted uppercase tracking-wider transition-colors">
                                {previewCoverUrl || (!isDefault && collection.cover_image) ? 'Change Image' : 'Upload Custom'}
                            </button>
                            {(!isDefault || previewCoverUrl) && (
                                <button onClick={markCoverForDeletion} className="bg-blood/10 text-blood hover:bg-blood hover:text-white text-[10px] font-bold px-3 py-2 rounded-sm border border-blood/30 transition-colors" title="Reset to default">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleCoverSelect} className="hidden" />
                    </div>

                    {/* метадані */}
                    <div className="bg-void border border-border p-6 rounded-sm shadow-2xl shadow-black">
                        <h3 className="text-xs font-bold text-muted mb-4 uppercase tracking-[0.2em]">Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-ash border border-border rounded-sm p-2 text-bone text-xs focus:border-blood outline-none transition-colors placeholder-muted/30"
                                    value={meta.title}
                                    onChange={(e) => handleMetaChange('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea 
                                    className="w-full bg-ash border border-border rounded-sm p-2 text-bone text-xs focus:border-blood outline-none transition-colors h-32 resize-none placeholder-muted/30 custom-scrollbar"
                                    value={meta.description}
                                    onChange={(e) => handleMetaChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* -права сортування самих картин */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                        <h3 className="text-xs font-bold text-bone uppercase tracking-[0.2em]">
                            Artifacts <span className="text-muted ml-2">({items.length})</span>
                        </h3>
                        <span className="text-[10px] text-muted flex items-center gap-1">
                            Drag <Bars2Icon className="w-3 h-3"/> to reorder
                        </span>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <div className="bg-void border border-border p-4 rounded-sm flex flex-col sm:flex-row gap-4 relative group hover:border-blood/50 transition-colors shadow-lg shadow-black/50">
                                            
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted cursor-grab active:cursor-grabbing sm:block hidden hover:text-bone p-2">
                                                <Bars2Icon className="w-5 h-5" />
                                            </div>

                                            <div className="w-full sm:w-20 h-20 bg-black rounded-sm overflow-hidden shrink-0 border border-border sm:ml-8 pointer-events-none">
                                                <img src={artworkService.getImageUrl(item.image_path)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-xs font-bold text-bone truncate pr-2 uppercase tracking-wide font-gothic">
                                                        {item.title}
                                                    </h4>
                                                    
                                                    <button 
                                                        onPointerDown={(e) => e.stopPropagation()} 
                                                        onClick={() => requestDeleteItem(item.artwork_id)} 
                                                        className="text-muted hover:text-blood transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                {collection.type === 'EXHIBITION' && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/30" onPointerDown={(e) => e.stopPropagation()}>
                                                        <div>
                                                            <label className="block text-[8px] text-muted uppercase mb-1 font-bold">Layout</label>
                                                            <Select 
                                                                value={item.layout_type || 'CENTER'}
                                                                onChange={(val) => handleItemChange(index, 'layout_type', val)}
                                                                options={layoutOptions}
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-[8px] text-muted uppercase mb-1 font-bold">Caption</label>
                                                            <input 
                                                                type="text" 
                                                                className="w-full bg-ash border border-border text-bone text-[10px] p-2 rounded-sm outline-none focus:border-blood placeholder-muted/30 h-8.5" 
                                                                placeholder="Add context..." 
                                                                value={item.context_description || ''} 
                                                                onChange={(e) => handleItemChange(index, 'context_description', e.target.value)} 
                                                            />
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

                <ConfirmModal 
                    isOpen={deleteItemModal.isOpen}
                    onClose={() => setDeleteItemModal({ isOpen: false, itemId: null })}
                    onConfirm={confirmDeleteItem}
                    title="Remove Artifact?"
                    message="This will remove the artwork from this collection. The artwork itself will remain in your database."
                    confirmText="Remove"
                />

                <ConfirmModal 
                    isOpen={deleteCollectionModal}
                    onClose={() => setDeleteCollectionModal(false)}
                    onConfirm={confirmDeleteCollection}
                    title="Destroy Collection?"
                    message="This action is irreversible. The collection and its arrangement will be lost forever."
                    confirmText="Destroy"
                />

            </EditorLayout>
        </>
    );
};

export default CollectionEditPage;