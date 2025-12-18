import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    // 👇 ТУТ ЗМІНА: Додали параметр isSilent
    const fetchAllData = async (isSilent = false) => {
        try {
            // Вмикаємо спінер, тільки якщо це НЕ тихе оновлення
            if (!isSilent) setLoading(true);
            
            const artworkData = await artworkService.getById(id);
            setArtwork(artworkData);

            const historyData = await sessionService.getHistory(id);
            setHistory(historyData);
        } catch (error) {
            console.error("Помилка:", error);
            navigate('/projects');
        } finally {
            // Вимикаємо спінер завжди (якщо він був увімкнений, він вимкнеться, якщо ні - нічого страшного)
            setLoading(false);
        }
    };

    // Перше завантаження - гучне (зі спінером)
    useEffect(() => {
        fetchAllData();
    }, [id]);

    const handleQuickStatusChange = async (newStatus) => {
        try {
            // 1. Оптимістичне оновлення UI (миттєва реакція)
            setArtwork(prev => ({ ...prev, status: newStatus }));

            let finishedData = null;

            // 2. Якщо вибрали "Завершено" або "Покинуто" -> ставимо СЬОГОДНІШНЮ дату
            if (newStatus === 'FINISHED' || newStatus === 'DROPPED') {
                const t = new Date();
                finishedData = {
                    year: t.getFullYear(),
                    month: t.getMonth() + 1, // Місяці в JS від 0 до 11
                    day: t.getDate()
                };
            } 
            // 3. Якщо повернули "В процесі" -> передаємо пусті рядки, щоб стерти дату
            else {
                finishedData = { year: '', month: '', day: '' };
            }

            // 4. Відправляємо на сервер
            await artworkService.updateStatus(id, newStatus, finishedData);
            
            // 5. Оновлюємо дані з сервера ТИХО (без блимання екрану)
            // 👇 ТУТ ЗМІНА: передаємо true
            fetchAllData(true); 
        } catch (error) {
            console.error(error);
            alert("Помилка оновлення статусу");
        }
    };

    // --- Допоміжні функції ---
    
    const formatDuration = (s) => {
         const h = Math.floor(s / 3600);
         const m = Math.floor((s % 3600) / 60);
         if (h > 0) return `${h} год ${m} хв`;
         return `${m} хв`;
    };

    const formatDate = (dateString) => {
         return new Date(dateString).toLocaleDateString('uk-UA', {
             day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
         });
    };

    const renderFuzzyDate = (y, m, d) => {
        if (!y) return '—';
        const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
        let str = `${y}`;
        if (m) str = `${months[m-1]} ${str}`;
        if (d) str = `${d}, ${str}`;
        return str;
    };

    const STATUSES = {
        'PLANNED': '📅 Заплановано',
        'SKETCH': '✏️ Скетч',
        'IN_PROGRESS': '🚧 В процесі',
        'FINISHED': '✅ Завершено',
        'ON_HOLD': '⏸ На паузі',
        'DROPPED': '❌ Покинуто'
    };

    if (loading) return <div className="text-center text-bone-200 mt-20">Завантаження досьє...</div>;
    if (!artwork) return null;

    return (
        <div className="p-4 md:p-8 relative min-h-screen">
            <div className="max-w-6xl mx-auto">
                
                {/* Кнопка Назад */}
                <Link to="/projects" className="text-slate-500 hover:text-cherry-500 mb-6 inline-flex items-center gap-2 transition group">
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Назад до архіву
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
                    
                    {/* ЛІВА КОЛОНКА: Зображення + Статус */}
                    <div className="bg-black rounded-lg border border-slate-800 overflow-hidden shadow-2xl relative group">
                        {artwork.image_path ? (
                            <img 
                                src={artworkService.getImageUrl(artwork.image_path)} 
                                alt={artwork.title}
                                className="w-full h-auto object-contain max-h-150"
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-600">Немає зображення</div>
                        )}
                        
                        {/* Швидкий статус */}
                        <div className="absolute top-4 right-4">
                            <select 
                                value={artwork.status}
                                onChange={(e) => handleQuickStatusChange(e.target.value)}
                                className="appearance-none bg-black/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg cursor-pointer hover:bg-cherry-900/80 hover:border-cherry-500 transition focus:outline-none text-center"
                            >
                                {Object.entries(STATUSES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ПРАВА КОЛОНКА: Інформація */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-cherry-500 mb-4 font-pixel tracking-wide leading-tight">
                                {artwork.title}
                            </h1>
                            
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-inner">
                                <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-bold">Опис проєкту</h3>
                                <p className="text-lg leading-relaxed text-bone-100 whitespace-pre-wrap">
                                    {artwork.description || <span className="text-slate-600 italic">Опис відсутній...</span>}
                                </p>
                            </div>
                        </div>

                        {/* Сітка характеристик */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Жанр</span>
                                <span className="text-cherry-300 font-bold text-lg">{artwork.genre_name || '—'}</span>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Стиль</span>
                                <span className="text-bone-200 text-lg">{artwork.style_name || '—'}</span>
                            </div>
                            
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Початок</span>
                                <span className="text-bone-200">{renderFuzzyDate(artwork.started_year, artwork.started_month, artwork.started_day)}</span>
                            </div>
                            
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Завершення</span>
                                <span className={`text-lg ${artwork.finished_year ? 'text-green-400' : 'text-slate-600'}`}>
                                    {renderFuzzyDate(artwork.finished_year, artwork.finished_month, artwork.finished_day)}
                                </span>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 col-span-2">
                                <span className="text-slate-500 text-xs uppercase block mb-2">Матеріали</span>
                                <span className="text-bone-200 leading-relaxed">
                                    {artwork.material_names ? artwork.material_names.split(',').map((m, i) => (
                                        <span key={i} className="inline-block bg-slate-800 px-2 py-1 rounded mr-2 mb-1 text-sm border border-slate-700">
                                            {m.trim()}
                                        </span>
                                    )) : '—'}
                                </span>
                            </div>
                        </div>

                        {/* Теги */}
                        {artwork.tag_names && (
                            <div className="flex flex-wrap gap-2">
                                {artwork.tag_names.split(',').map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-sm hover:text-bone-100 transition cursor-default">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* КНОПКА ПЕРЕХОДУ НА РЕДАГУВАННЯ */}
                        <div className="pt-4 border-t border-slate-800">
                            <Link 
                                to={`/projects/${id}/edit`} 
                                className="block w-full bg-slate-800 hover:bg-slate-700 text-center text-white font-bold py-4 rounded-lg transition border border-slate-700 hover:border-cherry-500 shadow-lg active:scale-[0.98]"
                            >
                                ✎ Редагувати дані проєкту
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- БЛОК ІСТОРІЇ (Сесії) --- */}
                <div className="border-t border-cherry-900/50 pt-12">
                     <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-cherry-500 flex items-center gap-3">
                            <span>📜</span> Історія та Процес
                        </h2>
                    </div>

                    <div className="bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-8 text-center mb-12 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-slate-400 mb-6 text-lg">Готові продовжити роботу над шедевром?</p>
                            <Link to={`/projects/${id}/session`}>
                                <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition transform hover:scale-105 flex items-center gap-3 mx-auto">
                                    <span>🎨</span> Перейти до Малювання
                                </button>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-400">Записи сеансів ({history.length})</h3>
                        {history.length === 0 ? (
                            <div className="text-slate-500 italic p-8 border border-slate-800 border-dashed rounded-lg text-center bg-slate-900/30">
                                Поки що тут пусто... Почніть перший сеанс, щоб творити історію!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((session) => (
                                    <div key={session.session_id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-slate-600 transition">
                                        <div className="md:min-w-40 md:border-r border-slate-800 md:pr-6 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start border-b md:border-b-0 pb-4 md:pb-0">
                                            <div className="text-cherry-400 font-bold text-xl font-mono">
                                                {formatDuration(session.duration_seconds)}
                                            </div>
                                            <div className="text-slate-500 text-sm mt-1">
                                                {formatDate(session.start_time)}
                                            </div>
                                        </div>
                                        <div className="grow">
                                            <p className="text-bone-200 whitespace-pre-wrap leading-relaxed">
                                                {session.note_content || <span className="text-slate-600 italic text-sm">Без нотаток</span>}
                                            </p>
                                        </div>
                                        {session.note_photo && (
                                            <div className="w-full md:w-32 h-32 shrink-0 bg-black rounded-lg overflow-hidden border border-slate-700 shadow-md">
                                                <img 
                                                    src={artworkService.getImageUrl(session.note_photo)} 
                                                    alt="Progress" 
                                                    className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition duration-300" 
                                                    onClick={() => window.open(artworkService.getImageUrl(session.note_photo), '_blank')} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;