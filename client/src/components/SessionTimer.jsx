import { useState, useEffect, useRef } from 'react';
import sessionService from '../services/sessionService';
import Button from './ui/Button';

const SessionTimer = ({ artworkId, onSessionSaved }) => {
    const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, PAUSED, CONFIRM, SAVING
    const [seconds, setSeconds] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const intervalRef = useRef(null);

    // Форма нотатки
    const [noteForm, setNoteForm] = useState({ content: '', image: null });
    // 👇 СТАН ДЛЯ ГАЛОЧКИ
    const [updateCover, setUpdateCover] = useState(false);

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

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleStart = async () => {
        try {
            const data = await sessionService.start(artworkId);
            setSessionId(data.id);
            setStatus('RUNNING');
        } catch (error) {
            alert("Помилка старту: " + error.message);
        }
    };

    const handlePause = () => setStatus(status === 'RUNNING' ? 'PAUSED' : 'RUNNING');
    const handleStopRequest = () => setStatus('CONFIRM');

    const confirmAction = (action) => {
        if (action === 'RESUME') setStatus('RUNNING');
        else if (action === 'DISCARD') {
            setStatus('IDLE');
            setSeconds(0);
            setSessionId(null);
        } 
        else if (action === 'SAVE') setStatus('SAVING');
    };

    const handleSaveSession = async (e) => {
        e.preventDefault();
        try {
            await sessionService.finish(sessionId, {
                duration: seconds,
                content: noteForm.content,
                image: noteForm.image,
                // 👇 Передаємо нові поля
                artworkId: artworkId,
                updateCover: updateCover
            });

            // Скидання
            setStatus('IDLE');
            setSeconds(0);
            setSessionId(null);
            setNoteForm({ content: '', image: null });
            setUpdateCover(false);

            if (onSessionSaved) onSessionSaved();
        } catch (error) {
            alert("Помилка збереження: " + error.message);
        }
    };

    // 1. IDLE
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

    // 2. RUNNING / PAUSED
    if (status === 'RUNNING' || status === 'PAUSED') {
        return (
            <div className="bg-slate-900 border border-cherry-900/50 rounded-lg p-8 text-center animate-fade-in relative overflow-hidden">
                {status === 'RUNNING' && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
                <div className="font-mono text-5xl md:text-7xl text-bone-100 mb-8 tracking-wider">{formatTime(seconds)}</div>
                <div className="flex justify-center gap-4">
                    <button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition">
                        {status === 'RUNNING' ? '⏸' : '▶'}
                    </button>
                    <button onClick={handleStopRequest} className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition shadow-lg shadow-red-900/30">
                        ⏹
                    </button>
                </div>
                <p className="text-slate-500 mt-4 text-sm uppercase tracking-widest">{status === 'RUNNING' ? 'Сеанс триває...' : 'На паузі'}</p>
            </div>
        );
    }

    // 3. CONFIRM
    if (status === 'CONFIRM') {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center animate-fade-in">
                <h3 className="text-xl text-bone-100 mb-2">Сеанс завершено?</h3>
                <p className="text-slate-400 mb-6 font-mono text-2xl">{formatTime(seconds)}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => confirmAction('SAVE')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold transition">💾 Так, зберегти результат</button>
                    <button onClick={() => confirmAction('RESUME')} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition">↩ Ні, повернутись до таймера</button>
                    <button onClick={() => confirmAction('DISCARD')} className="bg-transparent border border-red-900 text-red-500 hover:bg-red-900/20 py-2 rounded transition text-sm">🗑 Скинути (не зберігати)</button>
                </div>
            </div>
        );
    }

    // 4. SAVING FORM
    if (status === 'SAVING') {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-cherry-400 mb-4">Збереження результату</h3>
                <p className="text-bone-200 mb-4">Час сеансу: <span className="font-mono font-bold">{formatTime(seconds)}</span></p>
                
                <form onSubmit={handleSaveSession} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Що зроблено? (Нотатка)</label>
                        <textarea 
                            rows="3"
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none"
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                            placeholder="Накидала скетч..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Фото прогресу</label>
                        <div className="border border-slate-700 border-dashed rounded p-3 text-center cursor-pointer hover:bg-slate-800/50 transition relative">
                            <input 
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setNoteForm({...noteForm, image: e.target.files[0]})}
                            />
                            <span className="text-sm text-slate-400">
                                {noteForm.image ? `✅ Обрано: ${noteForm.image.name}` : '+ Натисни, щоб додати фото'}
                            </span>
                        </div>
                    </div>

                    {/* 👇 ОСЬ ВІН! ЧЕКБОКС ДЛЯ ОБКЛАДИНКИ */}
                    {noteForm.image && (
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
                            <input 
                                type="checkbox" 
                                id="updateCover"
                                checked={updateCover}
                                onChange={(e) => setUpdateCover(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-cherry-600 focus:ring-cherry-500 cursor-pointer accent-cherry-600"
                            />
                            <label htmlFor="updateCover" className="text-sm text-bone-200 cursor-pointer select-none">
                                📸 Зробити це фото <strong>головною обкладинкою</strong>?
                            </label>
                        </div>
                    )}

                    <Button text="💾 Зберегти в історію" className="w-full bg-cherry-700" />
                </form>
            </div>
        );
    }
};

export default SessionTimer;