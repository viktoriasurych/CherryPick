import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import sessionService from '../services/sessionService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DictSelect from '../components/ui/DictSelect';       
import MultiDictSelect from '../components/ui/MultiDictSelect'; // <--- Важливо

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    
    // Стан для редагування
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ 
        title: '', 
        description: '', 
        image: null,
        style_id: '',
        genre_id: '',
        material_ids: [],
        tag_ids: []
    });
    const [error, setError] = useState('');

    const fetchAllData = async () => {
        try {
            const artworkData = await artworkService.getById(id);
            setArtwork(artworkData);
            
            // Заповнюємо форму даними з бази
            setEditForm({ 
                title: artworkData.title, 
                description: artworkData.description, 
                image: null,
                style_id: artworkData.style_id || '',
                genre_id: artworkData.genre_id || '',
                material_ids: artworkData.material_ids || [], // Беремо масив ID
                tag_ids: artworkData.tag_ids || []           // Беремо масив ID
            });

            const historyData = await sessionService.getHistory(id);
            setHistory(historyData);

        } catch (error) {
            console.error("Помилка:", error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const formatDuration = (seconds) => {
         const h = Math.floor(seconds / 3600);
         const m = Math.floor((seconds % 3600) / 60);
         if (h > 0) return `${h} год ${m} хв`;
         return `${m} хв`;
    };

    const formatDate = (dateString) => {
         return new Date(dateString).toLocaleDateString('uk-UA', {
             day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
         });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await artworkService.update(id, editForm);
            setIsEditing(false);
            fetchAllData(); 
        } catch (error) {
            setError("Не вдалося оновити: " + (error.response?.data?.message || error.message));
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setArtwork({ ...artwork, status: newStatus });
            await artworkService.updateStatus(id, newStatus);
        } catch (error) {
            alert("Помилка зміни статусу");
            fetchAllData();
        }
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
        <div className="p-8 relative">
            <div className="max-w-6xl mx-auto">
                <Link to="/projects" className="text-slate-500 hover:text-cherry-500 mb-6 inline-block">
                    &larr; Назад до архіву
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    {/* Фото */}
                    <div className="bg-black rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                        {artwork.image_path ? (
                            <img 
                                src={artworkService.getImageUrl(artwork.image_path)} 
                                alt={artwork.title}
                                className="w-full h-auto object-contain max-h-150"
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-600">Немає зображення</div>
                        )}
                    </div>

                    {/* Інфо */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-pixel text-cherry-500 mb-2">{artwork.title}</h1>
                            <div className="inline-block relative group">
                                <select
                                    value={artwork.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="appearance-none bg-slate-800 text-xs px-4 py-1 rounded-full border border-slate-700 text-cherry-300 font-bold cursor-pointer hover:bg-slate-700 hover:border-cherry-500 transition focus:outline-none pr-8"
                                >
                                    {Object.entries(STATUSES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cherry-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Опис</h3>
                            <p className="text-lg leading-relaxed text-bone-100 whitespace-pre-wrap">
                                {artwork.description || "Опис відсутній."}
                            </p>
                        </div>

                        {/* ВИВІД МЕТАДАНИХ */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block">Жанр</span>
                                <span className="text-cherry-400 font-bold">{artwork.genre_name || '—'}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase block">Стиль</span>
                                <span className="text-bone-200">{artwork.style_name || '—'}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded border border-slate-800 col-span-2">
                                <span className="text-slate-500 text-xs uppercase block mb-1">Матеріали</span>
                                <span className="text-bone-200">{artwork.material_names || '—'}</span>
                            </div>
                        </div>

                        {/* Теги */}
                        {artwork.tag_names && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {artwork.tag_names.split(', ').map(tag => (
                                    <span key={tag} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-800 flex gap-4">
                            <Button text="✎ Редагувати" onClick={() => setIsEditing(true)} className="bg-slate-700 hover:bg-slate-600 flex-1" />
                        </div>
                    </div>
                </div>

                {/* Блок Сесій */}
                <div className="border-t border-cherry-900/50 pt-12">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-cherry-500">Історія та Процес</h2>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center mb-12 shadow-lg">
                        <p className="text-slate-400 mb-6 text-lg">Готові продовжити роботу над шедевром?</p>
                        <Link to={`/projects/${id}/session`}>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg shadow-green-900/20 transition transform hover:scale-105 flex items-center gap-3 mx-auto">
                                <span>🎨</span> Перейти до Малювання
                            </button>
                        </Link>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-400 mb-6">📜 Історія записів ({history.length})</h3>
                    {history.length === 0 ? (
                        <div className="text-slate-500 italic p-4 border border-slate-800 border-dashed rounded text-center">
                            Поки що тут пусто... Почніть перший сеанс!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((session) => (
                                <div key={session.session_id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-slate-600 transition">
                                    <div className="min-w-37.5 border-r border-slate-800 pr-6">
                                        <div className="text-cherry-400 font-bold text-lg">{formatDuration(session.duration_seconds)}</div>
                                        <div className="text-slate-500 text-sm mt-1">{formatDate(session.start_time)}</div>
                                    </div>
                                    <div className="grow">
                                        <p className="text-bone-200 whitespace-pre-wrap">
                                            {session.note_content || <span className="text-slate-600 italic">Без нотаток</span>}
                                        </p>
                                    </div>
                                    {session.note_photo && (
                                        <div className="w-24 h-24 shrink-0 bg-black rounded overflow-hidden border border-slate-700">
                                            <img src={artworkService.getImageUrl(session.note_photo)} alt="Progress" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition" onClick={() => window.open(artworkService.getImageUrl(session.note_photo), '_blank')} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-cherry-900 p-8 rounded-lg max-w-md w-full shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-cherry-500 mb-6">Редагування</h2>
                            {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-900 text-red-400 text-sm rounded">{error}</div>}
                            
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <Input label="Назва" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                                
                                <div className="space-y-4 pt-2 border-t border-slate-800">
                                    <DictSelect 
                                        type="genres" label="Жанр" 
                                        value={editForm.genre_id} 
                                        onChange={(val) => setEditForm({...editForm, genre_id: val})} 
                                    />
                                    <DictSelect 
                                        type="styles" label="Стиль" 
                                        value={editForm.style_id} 
                                        onChange={(val) => setEditForm({...editForm, style_id: val})} 
                                    />
                                    <MultiDictSelect 
                                        type="materials" label="Матеріали" 
                                        selectedIds={editForm.material_ids} 
                                        onChange={(ids) => setEditForm({...editForm, material_ids: ids})} 
                                    />
                                    <MultiDictSelect 
                                        type="tags" label="Теги" 
                                        selectedIds={editForm.tag_ids} 
                                        onChange={(ids) => setEditForm({...editForm, tag_ids: ids})} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Опис</label>
                                    <textarea rows="4" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none transition-colors" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Замінити фото (необов'язково)</label>
                                    <input type="file" onChange={(e) => setEditForm({...editForm, image: e.target.files[0]})} className="text-slate-400 text-sm" />
                                </div>
                                
                                <div className="flex gap-4 pt-4">
                                    <Button text="Зберегти" className="bg-cherry-700 flex-1" />
                                    <button type="button" onClick={() => setIsEditing(false)} className="bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-white px-4 py-2 rounded flex-1 transition">Скасувати</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetailsPage;