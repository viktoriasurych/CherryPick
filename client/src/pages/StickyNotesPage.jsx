import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
    PlusIcon, TrashIcon, MagnifyingGlassIcon, 
    Bars3BottomLeftIcon, ArrowLeftIcon 
} from '@heroicons/react/24/outline';

// Кольори (Tailwind класи)
const COLORS = {
    yellow: 'bg-[#fff7d1] text-slate-900',
    pink: 'bg-[#fbbcbc] text-slate-900',
    blue: 'bg-[#cbf1f5] text-slate-900',
    green: 'bg-[#ccf2d6] text-slate-900',
    purple: 'bg-[#e5d4ef] text-slate-900',
    dark: 'bg-[#333333] text-white border border-slate-700'
};

// Функція для форматування дати (Укр)
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return new Intl.DateTimeFormat('uk-UA', {
        month: isToday ? undefined : 'short', 
        day: isToday ? undefined : 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    }).format(date);
};

const StickyNotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Ширина сайдбару (тільки для десктопу)
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    
    const [editForm, setEditForm] = useState(null);
    const [saveStatus, setSaveStatus] = useState('saved');

    // 1. Завантаження нотаток
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get('/sticky-notes');
                setNotes(res.data);
                // На десктопі (ширина > 768px) відкриваємо першу нотатку автоматично
                if (window.innerWidth > 768 && res.data.length > 0) {
                    selectNote(res.data[0]);
                }
            } catch (error) {
                console.error("Не вдалося завантажити нотатки:", error);
            }
        };
        fetchNotes();
    }, []);

    // 2. Вибір нотатки
    const selectNote = (note) => {
        setSelectedId(note.id);
        setEditForm({ ...note });
    };

    // 3. Повернутися до списку (для мобілок)
    const goBackToList = () => {
        setSelectedId(null);
        setEditForm(null);
    };

    // 4. Створення
    const createNote = async () => {
        const newNote = { title: '', content: '', color: 'yellow' };
        try {
            const res = await api.post('/sticky-notes', newNote);
            setNotes([res.data, ...notes]);
            selectNote(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    // 5. Видалення
    const deleteNote = async (e, id) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Видалити наліпку?")) return;
        
        try {
            await api.delete(`/sticky-notes/${id}`);
            const filtered = notes.filter(n => n.id !== id);
            setNotes(filtered);
            
            if (selectedId === id) {
                // Якщо видалили відкриту нотатку
                if (window.innerWidth > 768 && filtered.length > 0) {
                    selectNote(filtered[0]); // На десктопі вибираємо наступну
                } else {
                    goBackToList(); // На мобілці йдемо в список
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 6. АВТОЗБЕРЕЖЕННЯ (З перевіркою змін)
    useEffect(() => {
        if (!editForm || !selectedId) return;

        // Знаходимо оригінал, щоб порівняти
        const originalNote = notes.find(n => n.id === selectedId);

        // Якщо нічого не змінилося — не оновлюємо дату і не шлемо запит
        if (originalNote && 
            editForm.title === originalNote.title && 
            editForm.content === originalNote.content && 
            editForm.color === originalNote.color
        ) {
            return;
        }

        // Оновлюємо локальний список (оптимістичне оновлення UI)
        setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, ...editForm, updated_at: new Date() } : n));
        setSaveStatus('unsaved');

        const timer = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                await api.put(`/sticky-notes/${selectedId}`, editForm);
                setSaveStatus('saved');
            } catch (e) {
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editForm?.title, editForm?.content, editForm?.color]); 

    // 7. Resizer (Зміна ширини сайдбару)
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 220 && newWidth < 600) setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // Фільтрація
    const filteredNotes = notes.filter(n => 
        (n.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (n.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-black overflow-hidden relative"> 
            
            {/* === ЛІВА ПАНЕЛЬ (СПИСОК) === */}
            <div 
                className={`
                    bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300
                    ${selectedId ? 'hidden md:flex' : 'flex w-full'} 
                    md:w-auto
                `}
                style={{ width: window.innerWidth > 768 ? sidebarWidth : '100%' }}
            >
                {/* Header Списку */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-white font-bold font-pixel flex items-center gap-2">
                        <Bars3BottomLeftIcon className="w-5 h-5 text-cherry-500"/>
                        Наліпки
                    </h2>
                    <button onClick={createNote} className="p-2 bg-cherry-600 hover:bg-cherry-500 text-white rounded-lg transition shadow-lg shadow-cherry-900/20">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Пошук */}
                <div className="p-4 pt-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Пошук..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-cherry-500 outline-none transition placeholder-slate-600"
                        />
                    </div>
                </div>

                {/* Список карток */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredNotes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => selectNote(note)}
                            className={`
                                p-4 rounded-xl cursor-pointer transition relative group border select-none flex flex-col gap-2
                                ${selectedId === note.id ? 'border-cherry-500 bg-slate-900 shadow-md' : 'border-slate-800 hover:bg-slate-900/60 bg-slate-900/30'}
                            `}
                        >
                            {/* ВЕРХНЯ ЧАСТИНА: Заголовок + Кнопка видалення (на десктопі) */}
                            <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-sm truncate w-full pr-2 ${note.title ? 'text-white' : 'text-slate-500 italic'}`}>
                                    {note.title || 'Нова нотатка'}
                                </h4>
                                
                                {/* Кнопка видалення (Тільки десктоп, при наведенні) */}
                                <button 
                                    onClick={(e) => deleteNote(e, note.id)}
                                    className="hidden md:group-hover:block text-slate-600 hover:text-red-500 transition -mt-1 -mr-2 p-1 rounded hover:bg-slate-800"
                                    title="Видалити"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* СЕРЕДИНА: Текст */}
                            <p className="text-xs text-slate-400 line-clamp-2 min-h-[1.5em] font-sans">
                                {note.content || '...'}
                            </p>
                            
                            {/* НИЖНЯ ЧАСТИНА: Дата + Індикатор кольору */}
                            {/* flex justify-between розводить їх по краях */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 mt-1">
                                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                    {formatDate(note.updated_at)}
                                </span>

                                <div className={`w-3 h-3 rounded-full shadow-sm border border-slate-900/10 shrink-0 ${COLORS[note.color].split(' ')[0]}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* === HANDLE (Тягалка ширини) - Тільки десктоп === */}
            <div 
                className="hidden md:block w-1 bg-slate-900 hover:bg-cherry-500 cursor-col-resize transition-colors z-10"
                onMouseDown={startResizing}
            />

            {/* === ПРАВА ПАНЕЛЬ (РЕДАКТОР) === */}
            <div className={`
                flex-1 bg-black flex flex-col h-full relative
                ${selectedId ? 'flex fixed inset-0 z-50 md:static md:z-0' : 'hidden md:flex'}
            `}>
                {selectedId && editForm ? (
                    <>
                        {/* Toolbar Редактора */}
                        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950 shrink-0">
                            
                            {/* Ліва частина тулбара */}
                            <div className="flex items-center gap-4">
                                {/* Кнопка НАЗАД (Тільки мобілка) */}
                                <button onClick={goBackToList} className="md:hidden text-slate-400 hover:text-white">
                                    <ArrowLeftIcon className="w-6 h-6" />
                                </button>

                                {/* Вибір кольору */}
                                <div className="flex gap-2">
                                    {Object.keys(COLORS).map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => setEditForm(prev => ({ ...prev, color }))}
                                            className={`w-5 h-5 rounded-full border-2 transition shadow-sm ${COLORS[color].split(' ')[0]} ${editForm.color === color ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-110'}`}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Права частина тулбара */}
                            <div className="flex items-center gap-4">
                                {/* Статус збереження */}
                                <div className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-slate-500">
                                    {saveStatus === 'saving' && <span className="animate-pulse text-yellow-500">Збереження...</span>}
                                    {saveStatus === 'saved' && <span className="text-green-500">Збережено</span>}
                                    {saveStatus === 'unsaved' && <span>Редагування...</span>}
                                </div>

                                {/* Кнопка видалення (Завжди доступна тут для зручності) */}
                                <button 
                                    onClick={() => deleteNote(null, selectedId)}
                                    className="text-slate-500 hover:text-red-500 transition p-2 hover:bg-slate-900 rounded-lg"
                                    title="Видалити наліпку"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Поле вводу */}
                        <div className={`flex-1 p-6 md:p-10 overflow-y-auto transition-colors duration-300 ${COLORS[editForm.color]}`}>
                            <input 
                                type="text" 
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Заголовок..."
                                className="w-full bg-transparent text-2xl md:text-3xl font-bold mb-4 outline-none placeholder-current/50 border-b border-transparent focus:border-current/20 pb-2 transition-colors"
                            />
                            <textarea 
                                value={editForm.content}
                                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Почніть писати тут..."
                                className="w-full h-[calc(100%-5rem)] bg-transparent resize-none outline-none text-base md:text-lg leading-relaxed placeholder-current/50 font-medium font-sans"
                            />
                        </div>
                    </>
                ) : (
                    /* Заглушка (Empty State) */
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700 select-none bg-black">
                        <Bars3BottomLeftIcon className="w-20 h-20 mb-4 opacity-20" />
                        <p className="text-lg font-pixel opacity-50 px-4 text-center">
                            Оберіть наліпку зі списку <br/> або створіть нову
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StickyNotesPage;