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

// 👇 ВИПРАВЛЕНО: Тепер повертає час із секундами (slice(0, 19))
const toLocalISO = (dateStringOrObject) => {
    if (!dateStringOrObject) return '';
    const date = new Date(dateStringOrObject);
    const offset = date.getTimezoneOffset() * 60000;
    // Було slice(0, 16) -> "2023-12-22T14:30"
    // Стало slice(0, 19) -> "2023-12-22T14:30:45"
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 19);
};

const SessionTimer = ({ artworkId, initialSession, onSessionSaved }) => {
    const [status, setStatus] = useState(initialSession ? (initialSession.is_running ? 'RUNNING' : 'PAUSED') : 'IDLE');
    const [seconds, setSeconds] = useState(initialSession ? initialSession.current_total_seconds : 0);
    
    // Час
    const [startTime, setStartTime] = useState(initialSession ? initialSession.created_at : null);
    const [endTimeInput, setEndTimeInput] = useState('');
    
    // Чи редагував користувач час вручну?
    const [isTimeEdited, setIsTimeEdited] = useState(false);

    // Дані форми
    const [noteForm, setNoteForm] = useState({ content: '', image: null });
    const [updateCover, setUpdateCover] = useState(false);
    
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
        }
    };

    const removeFile = () => {
        setNoteForm(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
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

            await sessionService.stop({
                manualDuration: finalDuration,
                content: noteForm.content,
                image: noteForm.image,
                updateCover: updateCover
            });

            setStatus('IDLE');
            setSeconds(0);
            setNoteForm({ content: '', image: null });
            setPreviewUrl(null);
            setUpdateCover(false);
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
                setUpdateCover(false);
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Початок</label>
                            {/* Початок теж з секундами, але readonly */}
                            <input 
                                type="datetime-local" 
                                step="1" 
                                disabled 
                                value={startTime ? toLocalISO(startTime) : ''} 
                                className="w-full bg-slate-800 rounded-lg p-2 text-xs text-slate-400 mt-1 cursor-not-allowed border border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-cherry-400 uppercase font-bold">Кінець</label>
                            {/* 👇 ДОДАНО step="1" для підтримки секунд */}
                            <input 
                                type="datetime-local" 
                                step="1"
                                required 
                                value={endTimeInput} 
                                min={startTime ? toLocalISO(startTime) : ''} 
                                max={toLocalISO(new Date())} 
                                onChange={handleEndTimeChange} 
                                className="w-full bg-slate-800 rounded-lg p-2 text-xs text-white mt-1 focus:ring-1 focus:ring-cherry-500 outline-none border border-slate-700" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Нотатка</label>
                        <textarea rows="2" className="w-full bg-slate-800 rounded-lg p-3 text-sm text-bone-200 mt-1 focus:ring-1 focus:ring-cherry-500 outline-none resize-none border border-slate-700 placeholder-slate-600" value={noteForm.content} onChange={(e) => setNoteForm({...noteForm, content: e.target.value})} placeholder="На чому зупинились?" />
                    </div>
                    
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Фото</label>
                        {previewUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-white/20 aspect-video group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 bg-slate-700 rounded-full hover:bg-white hover:text-black transition text-white shadow-lg"><PhotoIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={removeFile} className="p-2 bg-red-600 rounded-full hover:bg-red-500 text-white transition shadow-lg"><XMarkIcon className="w-5 h-5" /></button>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <label className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${updateCover ? 'bg-cherry-600 border-cherry-500 text-white shadow-lg' : 'bg-black/60 border-white/10 text-slate-300 backdrop-blur-sm hover:bg-black/80'}`}>
                                        <input type="checkbox" checked={updateCover} onChange={(e) => setUpdateCover(e.target.checked)} className="hidden" />
                                        {updateCover ? <CheckIcon className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>}
                                        <span className="text-xs font-bold">Обкладинка</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-700 hover:border-cherry-500/50 hover:bg-slate-800/50 rounded-xl p-4 text-center cursor-pointer transition-all h-24 flex flex-col items-center justify-center group">
                                <CloudArrowUpIcon className="w-6 h-6 text-slate-500 group-hover:text-cherry-500 transition-colors mb-1" />
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Додати фото</span>
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