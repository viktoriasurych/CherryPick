import { useState, useEffect, useRef } from 'react';
import { 
    PlayIcon, 
    PauseIcon, 
    PhotoIcon, 
    XMarkIcon, 
    CloudArrowUpIcon,
    CheckIcon
} from '@heroicons/react/24/solid'; 
import sessionService from '../services/sessionService';
import Button from './ui/Button';

// Форматування (00:00:00)
const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const toLocalISO = (dateStringOrObject) => {
    if (!dateStringOrObject) return '';
    const date = new Date(dateStringOrObject);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 19);
};

const SessionTimer = ({ artworkId, initialSession, onSessionSaved }) => {
    const [status, setStatus] = useState(initialSession ? (initialSession.is_running ? 'RUNNING' : 'PAUSED') : 'IDLE');
    const [seconds, setSeconds] = useState(initialSession ? initialSession.current_total_seconds : 0);
    const [sessionId, setSessionId] = useState(initialSession?.session_id || null);
    
    // Час
    const [startTime, setStartTime] = useState(initialSession ? initialSession.created_at : null);
    const [endTimeInput, setEndTimeInput] = useState('');
    const [isTimeEdited, setIsTimeEdited] = useState(false);

    // Дані форми
    const [noteForm, setNoteForm] = useState({ content: '', image: null });
    
    // 👇 Змінили назву, щоб не плутатись. Це відповідає за додавання в загальну галерею.
    const [addToGallery, setAddToGallery] = useState(false); 
    
    const [previewUrl, setPreviewUrl] = useState(null);

    const intervalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Таймер
    useEffect(() => {
        if (status === 'RUNNING') {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [status]);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    // --- HANDLERS ---

    const handleStart = async () => {
        try {
            const data = await sessionService.start(artworkId);
            setSessionId(data.session_id); // Виправлено: бекенд повертає session_id
            setSeconds(data.current_total_seconds);
            setStartTime(data.created_at);
            setStatus('RUNNING');
        } catch (error) {
            alert("Помилка: " + error.message);
        }
    };

    const handleTogglePause = async () => {
        try {
            const data = await sessionService.togglePause();
            setSeconds(data.current_total_seconds);
            setStatus(data.is_running ? 'RUNNING' : 'PAUSED');
        } catch (error) {
            alert("Помилка: " + error.message);
        }
    };

    const handleStopRequest = () => {
        setStatus('SAVING'); 
        setEndTimeInput(toLocalISO(new Date()));
        setIsTimeEdited(false); 
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNoteForm(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
            setAddToGallery(false); // Скидаємо галочку при виборі нового фото
        }
    };

    const removeFile = () => {
        setNoteForm(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
        setAddToGallery(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveSession = async (e) => {
        e.preventDefault();
        try {
            let finalDuration = seconds; 

            if (isTimeEdited) {
                const start = new Date(startTime);
                const end = new Date(endTimeInput);
                let diff = Math.floor((end - start) / 1000);
                if (diff < 0 || isNaN(diff)) diff = 0;
                finalDuration = diff;
            }

            // 👇 Відправляємо чіткий об'єкт
            await sessionService.stop({
                sessionId: sessionId, // Переконайся, що сервіс приймає або ID окремо, або в об'єкті
                manualDuration: finalDuration,
                content: noteForm.content,
                image: noteForm.image,
                addToGallery: addToGallery // 👇 ТУТ ВАЖЛИВО: true або false
            });

            setStatus('IDLE');
            setSeconds(0);
            setNoteForm({ content: '', image: null });
            setPreviewUrl(null);
            setAddToGallery(false);
            if (onSessionSaved) onSessionSaved();
        } catch (error) {
            alert("Помилка: " + error.message);
        }
    };

    const handleDiscard = async () => {
        if (window.confirm("Точно скинути прогрес? Це видалить поточну сесію.")) {
            try {
                await sessionService.discard();
                setStatus('IDLE');
                setSeconds(0);
                setStartTime(null);
                setNoteForm({ content: '', image: null });
                setPreviewUrl(null);
                setAddToGallery(false);
            } catch (error) {
                alert("Помилка скидання: " + error.message);
            }
        }
    };

    const handleEndTimeChange = (e) => {
        setEndTimeInput(e.target.value);
        setIsTimeEdited(true); 
    };

    // --- RENDER ---

    if (status === 'IDLE') {
        return (
            <div className="flex justify-center">
                <button 
                    onClick={handleStart} 
                    className="group relative flex items-center justify-center w-40 h-40 rounded-full bg-slate-900 border-2 border-cherry-600 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all transform hover:scale-105"
                >
                    <span className="absolute inset-0 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500"></span>
                    <PlayIcon className="w-16 h-16 text-white ml-2" />
                </button>
            </div>
        );
    }

    if (status === 'RUNNING' || status === 'PAUSED') {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] p-2 border border-white/10 shadow-2xl overflow-hidden flex items-center gap-2 pr-2">
                <div className="flex-1 flex flex-col justify-center pl-6 py-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {status === 'RUNNING' ? 'Запис...' : 'Пауза'}
                    </div>
                    <div className={`font-mono text-5xl font-bold tracking-tight tabular-nums transition-colors ${status === 'RUNNING' ? 'text-white' : 'text-slate-400'}`}>
                        {formatTime(seconds)}
                    </div>
                    
                    <button 
                        onClick={handleStopRequest}
                        className="mt-4 self-start flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                        Завершити
                    </button>
                </div>

                <button 
                    onClick={handleTogglePause}
                    className={`
                        w-32 h-32 rounded-[2rem] flex items-center justify-center transition-all shadow-inner
                        ${status === 'RUNNING' 
                            ? 'bg-cherry-600 hover:bg-cherry-500 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'}
                    `}
                >
                    {status === 'RUNNING' ? <PauseIcon className="w-12 h-12" /> : <PlayIcon className="w-12 h-12 ml-1" />}
                </button>
            </div>
        );
    }

    if (status === 'SAVING') {
        let previewSeconds = seconds;
        if (isTimeEdited) {
            const start = new Date(startTime);
            const end = new Date(endTimeInput);
            previewSeconds = Math.floor((end - start) / 1000);
            if (previewSeconds < 0 || isNaN(previewSeconds)) previewSeconds = 0;
        }

        return (
            <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-slate-950 p-6 flex justify-between items-center border-b border-white/5">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold">Разом часу</span>
                        <div className="text-2xl font-mono font-bold text-white mt-1">
                            {formatTime(previewSeconds)}
                        </div>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={handleDiscard} className="text-xs text-red-500 hover:text-red-400 font-bold px-3 py-1 rounded bg-red-900/20 border border-red-900/50">
                            Скинути
                        </button>
                    </div>
                </div>
                
                <form onSubmit={handleSaveSession} className="p-6 space-y-5">
                    
                    {/* Вибір часу */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Початок</label>
                            <input 
                                type="datetime-local" step="1" disabled 
                                value={startTime ? toLocalISO(startTime) : ''} 
                                className="w-full bg-slate-800 rounded-lg p-2 text-xs text-slate-400 mt-1 cursor-not-allowed border border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-cherry-400 uppercase font-bold">Кінець</label>
                            <input 
                                type="datetime-local" step="1" required 
                                value={endTimeInput} 
                                min={startTime ? toLocalISO(startTime) : ''} 
                                max={toLocalISO(new Date())} 
                                onChange={handleEndTimeChange} 
                                className="w-full bg-slate-800 rounded-lg p-2 text-xs text-white mt-1 focus:ring-1 focus:ring-cherry-500 outline-none border border-slate-700" 
                            />
                        </div>
                    </div>

                    {/* Нотатка */}
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Нотатка</label>
                        <textarea rows="2" className="w-full bg-slate-800 rounded-lg p-3 text-sm text-bone-200 mt-1 focus:ring-1 focus:ring-cherry-500 outline-none resize-none border border-slate-700 placeholder-slate-600" value={noteForm.content} onChange={(e) => setNoteForm({...noteForm, content: e.target.value})} placeholder="На чому зупинились?" />
                    </div>
                    
                    {/* СЕКЦІЯ ФОТО (БЕЗ ХОВЕРІВ) */}
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Фото</label>
                        
                        {previewUrl ? (
                            <div className="space-y-3">
                                {/* 1. Саме фото з кнопкою видалення (Завжди видна) */}
                                <div className="relative rounded-xl overflow-hidden border border-slate-600 bg-black aspect-video">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    
                                    {/* Кнопка видалення (фіксована) */}
                                    <button 
                                        type="button" 
                                        onClick={removeFile} 
                                        className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg text-white shadow-lg active:bg-red-700 transition"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* 2. Галочка "Додати в галерею" (Тільки якщо є фото) */}
                                <div 
                                    onClick={() => setAddToGallery(!addToGallery)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                                        ${addToGallery 
                                            ? 'bg-cherry-900/20 border-cherry-500/50' 
                                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0
                                        ${addToGallery ? 'bg-cherry-600 border-cherry-600' : 'border-slate-500 bg-transparent'}
                                    `}>
                                        {addToGallery && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${addToGallery ? 'text-white' : 'text-slate-300'}`}>
                                            Додати фото в галерею
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Фото буде видно не тільки в історії, а й у "Деталях" роботи
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Кнопка завантаження
                            <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-700 hover:border-cherry-500/50 hover:bg-slate-800/50 rounded-xl p-4 text-center cursor-pointer transition-all h-24 flex flex-col items-center justify-center group active:scale-95">
                                <CloudArrowUpIcon className="w-6 h-6 text-slate-500 group-hover:text-cherry-500 transition-colors mb-1" />
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Додати фото процесу</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>

                    <Button text="Зберегти в історію" className="w-full bg-cherry-600 hover:bg-cherry-500 py-3 rounded-xl font-bold shadow-lg shadow-cherry-900/20" />
                </form>
            </div>
        );
    }
};

export default SessionTimer;