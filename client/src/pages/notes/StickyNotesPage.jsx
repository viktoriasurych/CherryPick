import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import { 
    PlusIcon, TrashIcon, MagnifyingGlassIcon, 
    Bars3BottomLeftIcon, ArrowLeftIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';

// 👇 Імпорт модалки
import ConfirmModal from '../../components/shared/ConfirmModal';

// --- КОНФІГУРАЦІЯ КОЛЬОРІВ ---
const NOTE_THEMES = {
    pink:   'bg-[var(--note-pink-bg)] border-[var(--note-pink-border)] text-[var(--note-pink-text)]',
    yellow: 'bg-[var(--note-yellow-bg)] border-[var(--note-yellow-border)] text-[var(--note-yellow-text)]',
    blue:   'bg-[var(--note-blue-bg)] border-[var(--note-blue-border)] text-[var(--note-blue-text)]',
    green:  'bg-[var(--note-green-bg)] border-[var(--note-green-border)] text-[var(--note-green-text)]',
    purple: 'bg-[var(--note-purple-bg)] border-[var(--note-purple-border)] text-[var(--note-purple-text)]',
    dark:   'bg-[var(--note-dark-bg)] border-[var(--note-dark-border)] text-[var(--note-dark-text)]'
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date).toUpperCase(); 
};

const StickyNotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const [isResizing, setIsResizing] = useState(false);
    
    const [editForm, setEditForm] = useState(null);
    const [saveStatus, setSaveStatus] = useState('saved');

    // 👇 СТАН ДЛЯ МОДАЛКИ ВИДАЛЕННЯ
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get('/sticky-notes');
                setNotes(res.data);
                if (window.innerWidth > 768 && res.data.length > 0) {
                    selectNote(res.data[0]);
                }
            } catch (error) {
                console.error("Error loading notes:", error);
            }
        };
        fetchNotes();
    }, []);

    const selectNote = (note) => {
        setSelectedId(note.id);
        setEditForm({ ...note });
    };

    const goBackToList = () => {
        setSelectedId(null);
        setEditForm(null);
    };

    const createNote = async () => {
        const newNote = { title: '', content: '', color: 'pink' }; 
        try {
            const res = await api.post('/sticky-notes', newNote);
            setNotes([res.data, ...notes]);
            selectNote(res.data);
        } catch (e) {
            console.error("Create error:", e);
        }
    };

    // 👇 1. ЗАПИТ НА ВИДАЛЕННЯ (Відкриває модалку)
    const requestDelete = (e, id) => {
        if (e) e.stopPropagation();
        setDeleteConfirm({ isOpen: true, id });
    };

    // 👇 2. ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ (Виконує дію)
    const confirmDelete = async () => {
        const id = deleteConfirm.id;
        if (!id) return;

        try {
            await api.delete(`/sticky-notes/${id}`);
            const filtered = notes.filter(n => n.id !== id);
            setNotes(filtered);
            
            if (selectedId === id) {
                if (window.innerWidth > 768 && filtered.length > 0) {
                    selectNote(filtered[0]);
                } else {
                    goBackToList();
                }
            }
        } catch (e) {
            console.error("Delete error:", e);
        } finally {
            setDeleteConfirm({ isOpen: false, id: null });
        }
    };

    // --- AUTOSAVE LOGIC ---
    useEffect(() => {
        if (!editForm || !selectedId) return;
        const originalNote = notes.find(n => n.id === selectedId);
        if (!originalNote) return;

        const hasChanges = 
            editForm.title !== originalNote.title || 
            editForm.content !== originalNote.content || 
            editForm.color !== originalNote.color;

        if (!hasChanges) {
            if (saveStatus !== 'saved') setSaveStatus('saved');
            return;
        }

        setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, ...editForm, updated_at: new Date() } : n));
        setSaveStatus('unsaved');

        const timer = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                await api.put(`/sticky-notes/${selectedId}`, editForm);
                setSaveStatus('saved');
            } catch (e) {
                console.error("Autosave error:", e);
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [editForm, selectedId]);

    // --- RESIZER ---
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 250 && newWidth < 600) setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    // --- FILTERING ---
    const filteredNotes = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return notes.filter(n => 
            (n.title?.toLowerCase() || '').includes(q) || 
            (n.content?.toLowerCase() || '').includes(q)
        );
    }, [notes, searchQuery]);

    // --- RENDER HELPERS ---
    const renderSidebar = () => (
        <div 
            className={`
                bg-ash border-r border-border flex flex-col shrink-0 transition-all duration-300
                ${selectedId ? 'hidden md:flex' : 'flex w-full'} 
                md:w-auto h-full relative
            `}
            style={{ width: window.innerWidth > 768 ? sidebarWidth : '100%' }}
        >
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-deep/50 backdrop-blur-sm">
                <h2 className="text-blood font-bold font-gothic tracking-widest text-xl flex items-center gap-3">
                    <Bars3BottomLeftIcon className="w-6 h-6"/>
                    ARCHIVES
                </h2>
                <button 
                    onClick={createNote} 
                    className="p-2 border border-blood/30 text-blood hover:bg-blood hover:text-white rounded-sm transition-all duration-300 group"
                    title="New Scroll"
                >
                    <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <div className="p-4 shrink-0">
                <div className="relative group">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blood transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search archives..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-void border border-border rounded-sm py-2 pl-10 pr-4 text-xs font-mono text-bone focus:border-blood outline-none transition-all placeholder-muted/50"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredNotes.length === 0 && searchQuery && (
                    <div className="text-center text-muted text-xs font-mono py-10 uppercase tracking-widest">
                        Void returned nothing...
                    </div>
                )}
                
                {filteredNotes.map(note => (
                    <div 
                        key={note.id}
                        onClick={() => selectNote(note)}
                        className={`
                            p-4 rounded-sm cursor-pointer transition-all duration-300 relative group border
                            flex flex-col gap-2 select-none
                            ${selectedId === note.id 
                                ? 'border-blood bg-void shadow-[0_0_15px_rgba(159,18,57,0.1)]' 
                                : 'border-border hover:border-muted bg-void/30 hover:bg-void'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <h4 className={`font-bold font-gothic text-sm truncate w-full pr-2 tracking-wide ${note.title ? 'text-bone' : 'text-muted italic'}`}>
                                {note.title || 'New Scroll'}
                            </h4>
                            <button 
                                onClick={(e) => requestDelete(e, note.id)} // 👇 Виклик модалки
                                className="hidden md:group-hover:block text-muted hover:text-blood transition -mt-1 -mr-2 p-1"
                                title="Burn"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <p className="text-xs text-muted/70 line-clamp-2 min-h-[1.5em] font-mono leading-relaxed">
                            {note.content || '...'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-1">
                            <span className="text-[9px] text-muted/50 font-mono uppercase tracking-wider">
                                {formatDate(note.updated_at)}
                            </span>
                            <div className={`w-2 h-2 rounded-full border border-white/10 ${NOTE_THEMES[note.color].split(' ')[0]}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderEditor = () => (
        <div className={`
            flex-1 bg-void flex flex-col h-full relative
            ${selectedId ? 'flex fixed inset-0 z-50 md:static md:z-0' : 'hidden md:flex'}
        `}>
            {selectedId && editForm ? (
                <>
                    <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-deep/80 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-6">
                            <button onClick={goBackToList} className="md:hidden text-muted hover:text-white transition">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            
                            <div className="flex gap-3 bg-void/50 p-1.5 rounded-full border border-border">
                                {Object.keys(NOTE_THEMES).map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setEditForm(prev => ({ ...prev, color }))}
                                        className={`
                                            w-4 h-4 rounded-full transition-all duration-300
                                            ${NOTE_THEMES[color].split(' ')[0]} 
                                            ${editForm.color === color ? 'scale-125 ring-2 ring-bone ring-offset-2 ring-offset-black' : 'hover:scale-110 opacity-70 hover:opacity-100'}
                                        `}
                                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.2em]">
                                {saveStatus === 'saving' && <span className="animate-pulse text-blood">Saving...</span>}
                                {saveStatus === 'saved' && <span className="text-muted/50">Saved</span>}
                                {saveStatus === 'unsaved' && <span className="text-bone">Editing...</span>}
                                {saveStatus === 'error' && <span className="text-red-500 font-bold">Sync Error</span>}
                            </div>
                            
                            <button 
                                onClick={(e) => requestDelete(e, selectedId)} // 👇 Виклик модалки
                                className="text-muted hover:text-blood transition p-2 border border-transparent hover:border-blood/30 rounded-sm"
                                title="Burn Scroll"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className={`
                        flex-1 p-8 md:p-12 overflow-y-auto transition-colors duration-700 ease-in-out border-l border-border
                        ${NOTE_THEMES[editForm.color]} 
                    `}>
                        <div className="max-w-3xl mx-auto h-full flex flex-col">
                            <input 
                                type="text" 
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="TITLE OF THE SCROLL"
                                className="
                                    w-full bg-transparent text-3xl md:text-4xl font-bold font-gothic mb-8 
                                    outline-none placeholder-current/30 border-b-2 border-transparent 
                                    focus:border-current/20 pb-2 transition-colors tracking-wide uppercase
                                "
                            />
                            <textarea 
                                value={editForm.content}
                                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Inscribe your thoughts here..."
                                className="
                                    w-full flex-1 bg-transparent resize-none outline-none 
                                    text-sm md:text-base leading-loose font-mono 
                                    placeholder-current/30 scrollbar-none
                                "
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted select-none bg-void/50 border-l border-border">
                    <PencilSquareIcon className="w-16 h-16 mb-4 opacity-10 animate-pulse" />
                    <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 text-center">
                        Select a scroll to read <br/> or create a new prophecy
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-deep overflow-hidden relative">
            {renderSidebar()}
            
            <div 
                className="hidden md:block w-1 bg-border hover:bg-blood cursor-col-resize transition-colors z-20"
                onMouseDown={startResizing}
            />

            {renderEditor()}

            {/* 👇 ВСТАВЛЯЄМО МОДАЛКУ ПІДТВЕРДЖЕННЯ */}
            <ConfirmModal 
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Burn Scroll"
                message="This action is irreversible. The scroll will be lost to the void forever."
                confirmText="Burn It"
            />
        </div>
    );
};

export default StickyNotesPage;