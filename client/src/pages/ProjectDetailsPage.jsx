import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Стан даних
    const [artwork, setArtwork] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Стан перегляду (Яке фото зараз велике на сцені)
    const [selectedImage, setSelectedImage] = useState(null);
    
    // Реф для прихованого інпуту (кнопка +)
    const fileInputRef = useRef(null);

    // 1. ЗАВАНТАЖЕННЯ ДАНИХ
    const fetchAllData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            
            const artworkData = await artworkService.getById(id);
            setArtwork(artworkData);
            
            // Логіка вибору фото:
            // Якщо це перше завантаження (!isSilent) і нічого не вибрано (!selectedImage) -> ставимо обкладинку.
            // Якщо це "тихе" оновлення (наприклад, змінили статус), ми НЕ чіпаємо те, що користувач зараз роздивляється.
            if (!isSilent && !selectedImage) {
                setSelectedImage(artworkData.image_path);
            }

            const historyData = await sessionService.getHistory(id);
            setHistory(historyData);
        } catch (error) {
            console.error("Помилка:", error);
            // navigate('/projects'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [id]);

    // 2. ЗМІНА СТАТУСУ (Швидка)
    const handleQuickStatusChange = async (newStatus) => {
        try {
            // Оптимістичне оновлення інтерфейсу
            setArtwork(prev => ({ ...prev, status: newStatus }));
            
            let finishedData = null;
            if (newStatus === 'FINISHED' || newStatus === 'DROPPED') {
                const t = new Date();
                finishedData = { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
            } else {
                finishedData = { year: '', month: '', day: '' };
            }
            
            await artworkService.updateStatus(id, newStatus, finishedData);
            fetchAllData(true); // Тихе оновлення даних
        } catch (error) {
            console.error(error);
            alert("Помилка оновлення статусу");
        }
    };

    // 3. ЗАВАНТАЖЕННЯ ФОТО В ГАЛЕРЕЮ (ФРАГМЕНТ)
    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await artworkService.addGalleryImage(id, file, 'Деталь');
            fetchAllData(true); // Оновлюємо стрічку
        } catch (error) {
            alert('Не вдалося завантажити фото');
        }
    };

    // --- Helpers ---
    const formatDuration = (s) => {
         const h = Math.floor(s / 3600);
         const m = Math.floor((s % 3600) / 60);
         if (h > 0) return `${h} год ${m} хв`;
         return `${m} хв`;
    };
    
    const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA', { 
        day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' 
    });
    
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

    if (loading) return <div className="text-center text-bone-200 mt-20">Завантаження...</div>;
    if (!artwork) return null;

    // 👇 ФОРМУВАННЯ СТРІЧКИ (ТІЛЬКИ Обкладинка + Галерея)
    const allImages = [];
    const addedPaths = new Set(); // Щоб слідкувати за унікальністю

    // 1. Обкладинка (Завжди перша)
    if (artwork.image_path) {
        allImages.push({
            id: 'cover_main',
            src: artwork.image_path,
            type: 'ОБКЛАДИНКА',
            isCover: true
        });
        addedPaths.add(artwork.image_path);
    }

    // 2. Галерея (Деталі + Старі обкладинки, якщо ми їх туди зберегли)
    if (artwork.gallery) {
        artwork.gallery.forEach(img => {
            // Додаємо в список, якщо цього шляху ще немає (щоб не дублювати поточну обкладинку)
            if (!addedPaths.has(img.image_path)) {
                allImages.push({
                    id: `gal_${img.id}`,
                    src: img.image_path,
                    type: 'ДЕТАЛЬ'
                });
                addedPaths.add(img.image_path);
            }
        });
    }

    // ❌ ІСТОРІЮ ТУТ НЕ ДОДАЄМО (Вона залишається внизу)

    // Визначаємо поточне фото для відображення
    const currentSrc = selectedImage || artwork.image_path;
    // Знаходимо об'єкт для бейджика
    const currentImageObj = allImages.find(img => img.src === currentSrc) || { type: 'IMG' };

    return (
        <div className="p-4 md:p-8 relative min-h-screen">
            <div className="max-w-6xl mx-auto">
                <Link to="/projects" className="text-slate-500 hover:text-cherry-500 mb-6 inline-flex items-center gap-2">&larr; Назад</Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    
                    {/* 👇 ЛІВА КОЛОНКА: КІНОТЕАТР */}
                    <div className="lg:col-span-2 space-y-4">
                        
                        {/* ЕКРАН */}
                        <div className="bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative group h-[500px] flex items-center justify-center">
                            {currentSrc ? (
                                <img 
                                    src={artworkService.getImageUrl(currentSrc)} 
                                    alt="Selected" 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-slate-600">Немає зображень</div>
                            )}
                            
                            {/* Інфо-бейдж */}
                            {currentSrc && (
                                <div className="absolute top-4 left-4 bg-cherry-900/80 backdrop-blur px-3 py-1 rounded text-xs text-white border border-cherry-500/50 uppercase font-bold tracking-wider shadow-lg">
                                    {currentImageObj.type} {currentImageObj.date ? `• ${currentImageObj.date}` : ''}
                                </div>
                            )}

                            {/* Статус */}
                            <div className="absolute top-4 right-4">
                                <select 
                                    value={artwork.status}
                                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                                    className="appearance-none bg-black/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg cursor-pointer hover:border-cherry-500 text-center focus:outline-none"
                                >
                                    {Object.entries(STATUSES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* СТРІЧКА (Тільки Галерея) */}
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 p-1">
                            
                            {/* Кнопка + (Фрагмент) */}
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="min-w-[80px] h-[80px] bg-slate-900 border border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-cherry-500 hover:border-cherry-500 transition shrink-0 cursor-pointer group"
                                title="Додати фото деталі"
                            >
                                <span className="text-2xl group-hover:scale-110 transition">+</span>
                                <span className="text-[10px] uppercase font-bold">Фрагмент</span>
                                <input type="file" ref={fileInputRef} onChange={handleGalleryUpload} className="hidden" />
                            </div>

                            {/* Картинки */}
                            {allImages.map((img) => (
                                <div 
                                    key={img.id} 
                                    onClick={() => setSelectedImage(img.src)} 
                                    className={`
                                        min-w-[80px] h-[80px] rounded-lg overflow-hidden cursor-pointer border-2 transition relative shrink-0 
                                        ${currentSrc === img.src ? 'border-cherry-500 scale-105 z-10 shadow-lg shadow-cherry-900/50' : 'border-transparent opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    <img 
                                        src={artworkService.getImageUrl(img.src)} 
                                        alt={img.type} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute bottom-0 w-full text-[8px] text-center text-white py-0.5 font-bold uppercase truncate px-1
                                        ${img.type.includes('ОБКЛАДИНКА') ? 'bg-cherry-700' : 'bg-slate-800/90'}
                                    `}>
                                        {img.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 👇 ПРАВА КОЛОНКА: ІНФОРМАЦІЯ */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-cherry-500 mb-4 font-pixel">{artwork.title}</h1>
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-inner">
                                <p className="text-bone-100 whitespace-pre-wrap">{artwork.description || "Опис відсутній..."}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Жанр</span>
                                <span className="text-cherry-300 font-bold">{artwork.genre_name || '—'}</span>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Стиль</span>
                                <span className="text-bone-200">{artwork.style_name || '—'}</span>
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
                                        <span key={i} className="inline-block bg-slate-800 px-2 py-1 rounded mr-2 mb-1 text-sm border border-slate-700">{m.trim()}</span>
                                    )) : '—'}
                                </span>
                            </div>
                        </div>

                        {artwork.tag_names && (
                            <div className="flex flex-wrap gap-2">
                                {artwork.tag_names.split(',').map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-sm">#{tag.trim()}</span>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-800">
                            <Link to={`/projects/${id}/edit`} className="block w-full bg-slate-800 hover:bg-slate-700 text-center text-white font-bold py-3 rounded-lg border border-slate-700 hover:border-cherry-500 transition shadow-lg">
                                ✎ Редагувати дані
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 👇 БЛОК ІСТОРІЇ */}
                <div className="border-t border-cherry-900/50 pt-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-cherry-500 mb-8 flex items-center gap-3">
                        <span>📜</span> Історія та Процес
                    </h2>

                    {/* ЗЕЛЕНА КНОПКА ТУТ */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-8 text-center mb-12 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-slate-400 mb-6 text-lg">Готові продовжити роботу над шедевром?</p>
                            <Link to={`/projects/${id}/session`}>
                                <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition transform hover:scale-105 flex items-center gap-3 mx-auto">
                                    <span>🎨</span> Перейти до Малювання
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {history.map((session) => (
                            <div key={session.session_id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-slate-600 transition">
                                <div className="md:min-w-40 md:border-r border-slate-800 md:pr-6">
                                    <div className="text-cherry-400 font-bold text-xl font-mono">{formatDuration(session.duration_seconds)}</div>
                                    <div className="text-slate-500 text-sm mt-1">{formatDate(session.start_time)}</div>
                                </div>
                                <div className="grow">
                                    <p className="text-bone-200 whitespace-pre-wrap">{session.note_content || <span className="text-slate-600 italic">Без нотаток</span>}</p>
                                </div>
                                {session.note_photo && (
                                    <div 
                                        className="w-32 h-32 shrink-0 bg-black rounded border border-slate-700 overflow-hidden cursor-pointer group/zoom"
                                        onClick={() => {
                                            // Клік по фото в історії відкриває його на "Сцені"
                                            setSelectedImage(session.note_photo);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        <img 
                                            src={artworkService.getImageUrl(session.note_photo)} 
                                            className="w-full h-full object-cover group-hover/zoom:scale-110 transition duration-500" 
                                            alt="Progress" 
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-slate-500 italic p-8 border border-dashed border-slate-800 rounded text-center">
                                Історія поки порожня. Почніть першу сесію!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;