import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ClockIcon, PaintBrushIcon } from '@heroicons/react/24/outline'; // Додали іконки
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';
import SessionTimer from '../components/SessionTimer';

const SessionPage = () => {
    const { id } = useParams(); // ID з URL (якщо зайшли з конкретної картини)
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null); // Якщо вже щось тікає
    const [targetArtwork, setTargetArtwork] = useState(null); // Картина, яку хочемо почати

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Спочатку питаємо: "Чи щось вже запущено?"
                const current = await sessionService.getCurrent();
                
                if (current) {
                    // ТАК: Показуємо активну сесію (ігноруємо URL id)
                    setActiveSession(current);
                } else if (id) {
                    // НІ, але є ID в URL: Вантажимо інфу про картину для старту
                    const artworkData = await artworkService.getById(id);
                    setTargetArtwork(artworkData);
                } 
                // 👇 ЯКЩО НІЧОГО НЕМАЄ — ПРОСТО НІЧОГО НЕ РОБИМО.
                // Loading стане false, і ми покажемо блок "Немає сеансу".
                
            } catch (error) {
                console.error(error);
                // Тут можна залишити редирект тільки якщо сталася реальна помилка сервера
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]); // Прибрали navigate із залежностей

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 animate-pulse">Синхронізація часу...</div>;

    // 👇 ВАРІАНТ 1: НЕМАЄ АКТИВНОГО СЕАНСУ І НЕ ОБРАНО КАРТИНУ
    if (!activeSession && !targetArtwork) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-slate-900/50 p-8 rounded-full mb-6 border border-slate-800">
                    <ClockIcon className="w-16 h-16 text-slate-600" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Немає активних сеансів
                </h1>
                
                <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
                    Зараз таймер зупинено. Щоб почати відлік часу, оберіть картину зі своєї колекції та натисніть кнопку "Почати сеанс".
                </p>
                
                <Link 
                    to="/projects" 
                    className="flex items-center gap-2 bg-cherry-600 hover:bg-cherry-500 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-cherry-900/40 hover:scale-105"
                >
                    <PaintBrushIcon className="w-5 h-5" />
                    Перейти до архіву картин
                </Link>
            </div>
        );
    }

    // 👇 ВАРІАНТ 2: Є ЩО ПОКАЗАТИ (Або активний, або підготовка до старту)
    const displayArtwork = activeSession 
        ? { title: activeSession.artwork_title, image_path: activeSession.image_path, id: activeSession.artwork_id }
        : targetArtwork;

    if (!displayArtwork) return null; // На всяк випадок

    return (
        <div className="min-h-screen bg-black text-bone-200 flex flex-col">
            {/* Хедер */}
            <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/30 backdrop-blur-sm fixed top-0 w-full z-20">
                <div className="flex items-center gap-4">
                    <Link to={`/projects/${displayArtwork.id}`} className="text-slate-500 hover:text-white transition flex items-center gap-1 text-sm font-bold">
                        &larr; Назад до проєкту
                    </Link>
                    <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
                    <h1 className="text-lg font-bold text-slate-300 truncate max-w-[200px] sm:max-w-md">
                        {displayArtwork.title} 
                        <span className="text-cherry-500 text-xs font-normal ml-2 uppercase tracking-widest border border-cherry-900/30 px-2 py-0.5 rounded bg-cherry-900/10">
                            {activeSession ? 'Триває сеанс' : 'Підготовка'}
                        </span>
                    </h1>
                </div>
            </div>

            {/* Робоча зона (padding-top щоб не ховалось під хедер) */}
            <div className="grow flex flex-col md:flex-row h-full pt-16">
                
                {/* ЛІВА ЧАСТИНА: Референс */}
                <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-[#0a0a0a] border-r border-slate-900 relative overflow-hidden min-h-[50vh] md:min-h-0">
                    {/* Фонова розмита картинка */}
                    <div className="absolute inset-0 opacity-20 blur-3xl scale-125 z-0 pointer-events-none">
                         {displayArtwork.image_path && <img src={artworkService.getImageUrl(displayArtwork.image_path)} className="w-full h-full object-cover" />}
                    </div>

                    <div className="z-10 relative w-full h-full flex items-center justify-center">
                        {displayArtwork.image_path ? (
                            <img 
                                src={artworkService.getImageUrl(displayArtwork.image_path)} 
                                alt="Reference" 
                                className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-lg border border-slate-800"
                            />
                        ) : (
                            <div className="text-slate-600 border border-slate-800 p-10 rounded bg-slate-900/50 flex flex-col items-center">
                                <PaintBrushIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span>Без референсу</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: Таймер */}
                <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-slate-950 relative border-t md:border-t-0 border-slate-900">
                    <div className="w-full max-w-md z-10">
                        <SessionTimer 
                            initialSession={activeSession}
                            artworkId={displayArtwork.id} 
                            onSessionSaved={() => navigate(`/projects/${displayArtwork.id}`)} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionPage;