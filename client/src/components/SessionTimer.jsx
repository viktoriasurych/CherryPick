import { useState, useEffect, useRef } from 'react';
import sessionService from '../services/sessionService';
import Button from './ui/Button';

// Форматування часу для таймера (00:00:00)
const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// Хелпер для перетворення дати у формат input type="datetime-local" (YYYY-MM-DDTHH:mm)
const toLocalISO = (dateStringOrObject) => {
    const date = new Date(dateStringOrObject);
    // Враховуємо зміщення часового поясу, щоб час був локальним, а не UTC
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
};

const SessionTimer = ({ artworkId, initialSession, onSessionSaved }) => {
    const [status, setStatus] = useState(initialSession ? (initialSession.is_running ? 'RUNNING' : 'PAUSED') : 'IDLE');
    const [seconds, setSeconds] = useState(initialSession ? initialSession.current_total_seconds : 0);
    
    // Зберігаємо ДАТУ СТВОРЕННЯ (Початок)
    // Якщо сесія вже була - беремо з неї. Якщо ні - буде null до старту.
    const [startTime, setStartTime] = useState(initialSession ? initialSession.created_at : null);
    
    // Стан для редагування КІНЦЕВОГО часу
    const [endTimeInput, setEndTimeInput] = useState('');

    const [noteForm, setNoteForm] = useState({ content: '', image: null });
    const [updateCover, setUpdateCover] = useState(false);
    const intervalRef = useRef(null);

    // Таймер цокає
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

    const handleStart = async () => {
        try {
            const data = await sessionService.start(artworkId);
            setSeconds(data.current_total_seconds);
            setStartTime(data.created_at); // Запам'ятовуємо, коли почали
            setStatus('RUNNING');
        } catch (error) {
            alert("Помилка старту: " + error.message);
        }
    };

    const handleTogglePause = async () => {
        try {
            const data = await sessionService.togglePause();
            setSeconds(data.current_total_seconds);
            // created_at не змінюється, тож не чіпаємо startTime
            setStatus(data.is_running ? 'RUNNING' : 'PAUSED');
        } catch (error) {
            alert("Помилка паузи: " + error.message);
        }
    };

    // КОЛИ НАТИСНУЛИ СТОП
    const handleStopRequest = () => {
        setStatus('CONFIRM');
        // Встановлюємо в інпут поточний час як час завершення
        setEndTimeInput(toLocalISO(new Date()));
    };

    const confirmAction = (action) => {
        if (action === 'RESUME') setStatus('PAUSED');
        else if (action === 'DISCARD') { setStatus('IDLE'); setSeconds(0); }
        else if (action === 'SAVE') setStatus('SAVING');
    };

    const handleSaveSession = async (e) => {
        e.preventDefault();
        try {
            // 👇 ТУТ МАГІЯ: РАХУЄМО РІЗНИЦЮ ЧАСУ
            const start = new Date(startTime);
            const end = new Date(endTimeInput); // Те, що ввів юзер
            
            // Різниця в мілісекундах -> в секунди
            let calculatedDuration = Math.floor((end - start) / 1000);

            // Захист від дурня (якщо ввели час менший за старт)
            if (calculatedDuration < 0) calculatedDuration = 0;

            await sessionService.stop({
                manualDuration: calculatedDuration, // Відправляємо вирахувані секунди
                content: noteForm.content,
                image: noteForm.image,
                updateCover: updateCover
            });

            setStatus('IDLE');
            setSeconds(0);
            setNoteForm({ content: '', image: null });
            setUpdateCover(false);
            if (onSessionSaved) onSessionSaved();
        } catch (error) {
            alert("Помилка: " + error.message);
            setStatus('SAVING'); 
        }
    };

    // --- РЕНДЕР ---

    if (status === 'IDLE') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400 mb-4">Готові попрацювати?</p>
                <button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg shadow-green-900/20 transition transform hover:scale-105">
                    ▶ Почати Сеанс
                </button>
            </div>
        );
    }

    if (status === 'RUNNING' || status === 'PAUSED') {
        return (
            <div className="bg-slate-900 border border-cherry-900/50 rounded-lg p-8 text-center animate-fade-in relative overflow-hidden">
                {status === 'RUNNING' && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
                <div className="font-mono text-5xl md:text-7xl text-bone-100 mb-8 tracking-wider tabular-nums">
                    {formatTime(seconds)}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={handleTogglePause} className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition text-white ${status === 'RUNNING' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {status === 'RUNNING' ? '⏸' : '▶'}
                    </button>
                    <button onClick={handleStopRequest} className="bg-red-600 hover:bg-red-700 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl transition shadow-lg shadow-red-900/30">
                        ⏹
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'CONFIRM') {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center animate-fade-in">
                <h3 className="text-xl text-bone-100 mb-2">Сеанс завершено?</h3>
                <p className="text-slate-400 mb-6 font-mono text-2xl">{formatTime(seconds)}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => confirmAction('SAVE')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold transition">💾 Зберегти результат</button>
                    <button onClick={() => confirmAction('RESUME')} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition">↩ Повернутись</button>
                    <button onClick={() => confirmAction('DISCARD')} className="bg-transparent border border-red-900 text-red-500 hover:bg-red-900/20 py-2 rounded transition text-sm">🗑 Скинути</button>
                </div>
            </div>
        );
    }

    if (status === 'SAVING') {
        // Обчислюємо поточну тривалість для відображення в реальному часі при зміні інпуту
        const start = new Date(startTime);
        const end = new Date(endTimeInput);
        let previewSeconds = Math.floor((end - start) / 1000);
        if (previewSeconds < 0 || isNaN(previewSeconds)) previewSeconds = 0;

        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 animate-fade-in text-left">
                <h3 className="text-xl font-bold text-cherry-400 mb-4 text-center">Збереження</h3>
                
                <form onSubmit={handleSaveSession} className="space-y-6">
                    
                    {/* 👇 БЛОК РЕДАГУВАННЯ ЧАСУ */}
                    <div className="bg-black/50 p-4 rounded border border-slate-800 space-y-4">
                        
                        {/* ПОЧАТОК (Read Only) */}
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Початок (фіксовано)</label>
                            <input 
                                type="datetime-local" 
                                disabled
                                value={startTime ? toLocalISO(startTime) : ''}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-slate-400 text-sm cursor-not-allowed"
                            />
                        </div>

                        {/* КІНЕЦЬ (Редагований) */}
                        <div>
                            <label className="block text-[10px] text-cherry-400 uppercase mb-1 font-bold">Кінець (можна змінити)</label>
                            <input 
                                type="datetime-local" 
                                required
                                value={endTimeInput}
                                // min = час початку (не можна закінчити раніше, ніж почала)
                                min={startTime ? toLocalISO(startTime) : ''}
                                // max = зараз (не можна закінчити в майбутньому)
                                max={toLocalISO(new Date())}
                                onChange={(e) => setEndTimeInput(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 focus:border-cherry-500 rounded p-2 text-white text-sm outline-none"
                            />
                        </div>

                        {/* ПІДСУМОК ЧАСУ */}
                        <div className="text-center pt-2 border-t border-slate-800">
                            <span className="text-xs text-slate-500">Разом часу:</span>
                            <div className="text-xl font-mono font-bold text-bone-100">
                                {formatTime(previewSeconds)}
                            </div>
                        </div>
                    </div>

                    {/* НОТАТКА */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Що зроблено?</label>
                        <textarea 
                            rows="2"
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none"
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                            placeholder="Опишіть прогрес..."
                        />
                    </div>
                    
                    {/* ФОТО */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Фото прогресу</label>
                        <div className="border border-slate-700 border-dashed rounded p-3 text-center cursor-pointer hover:bg-slate-800/50 transition relative group">
                            <input 
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setNoteForm({...noteForm, image: e.target.files[0]})}
                            />
                            <span className="text-sm text-slate-400 group-hover:text-white transition">
                                {noteForm.image ? `✅ ${noteForm.image.name}` : '+ Додати фото'}
                            </span>
                        </div>
                    </div>

                    {noteForm.image && (
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
                            <input 
                                type="checkbox" 
                                id="updateCover"
                                checked={updateCover}
                                onChange={(e) => setUpdateCover(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-cherry-600 cursor-pointer accent-cherry-600"
                            />
                            <label htmlFor="updateCover" className="text-sm text-bone-200 cursor-pointer select-none">
                                📸 Зробити обкладинкою?
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={() => confirmAction('RESUME')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition">
                            Назад
                        </button>
                        <Button text="Зберегти" className="flex-[2] bg-cherry-700" />
                    </div>
                </form>
            </div>
        );
    }
};

export default SessionTimer;