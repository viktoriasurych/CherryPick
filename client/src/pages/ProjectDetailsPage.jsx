// client/src/pages/ProjectDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // СТАН ДЛЯ РЕДАГУВАННЯ
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', image: null });
    
    // 👇 Стан для повідомлення про помилку (замість alert)
    const [error, setError] = useState('');

    // Завантаження даних
    const fetchArtwork = async () => {
        try {
            const data = await artworkService.getById(id);
            setArtwork(data);
            setEditForm({ 
                title: data.title, 
                description: data.description, 
                image: null 
            });
        } catch (error) {
            console.error("Помилка:", error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtwork();
    }, [id]);

    // Логіка кнопок
    const handleEditClick = () => {
        setError(''); // Очищаємо старі помилки
        setIsEditing(true);
        setEditForm({ 
            title: artwork.title, 
            description: artwork.description, 
            image: null 
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(''); // Скидаємо помилку перед новим запитом
        
        try {
            await artworkService.update(id, editForm);
            
            setIsEditing(false); // ✅ Успіх: Просто закриваємо вікно
            fetchArtwork();      // Оновлюємо дані на сторінці
            
        } catch (error) {
            // ❌ Помилка: Показуємо текст у формі
            setError("Не вдалося оновити: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="text-center text-bone-200 mt-20">Завантаження досьє...</div>;
    if (!artwork) return null;

    return (
        // 👇 1. ПРИБРАЛИ bg-vampire ТА min-h-screen (це тепер робить Layout)
        <div className="p-8 relative"> 
            <div className="max-w-6xl mx-auto">
                
                <Link to="/projects" className="text-slate-500 hover:text-cherry-500 mb-6 inline-block">
                    &larr; Назад до архіву
                </Link>

                {/* Основний контент */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    
                    {/* ЛІВА КОЛОНКА: ФОТО */}
                    <div className="bg-black rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                        {artwork.image_path ? (
                            <img 
                                src={artworkService.getImageUrl(artwork.image_path)} 
                                alt={artwork.title}
                                className="w-full h-auto object-contain max-h-[600px]"
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-600">
                                Немає зображення
                            </div>
                        )}
                    </div>

                    {/* ПРАВА КОЛОНКА: ІНФОРМАЦІЯ */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-pixel text-cherry-500 mb-2">{artwork.title}</h1>
                            <span className="inline-block bg-slate-800 text-xs px-3 py-1 rounded-full border border-slate-700 text-cherry-300">
                                {artwork.status || 'STATUS_UNKNOWN'}
                            </span>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Опис</h3>
                            <p className="text-lg leading-relaxed text-bone-100 whitespace-pre-wrap">
                                {artwork.description || "Опис відсутній."}
                            </p>
                        </div>

                        {/* БЛОК ТЕГІВ */}
                        <div>
                            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Матеріали / Теги</h3>
                            <div className="flex gap-2">
                                <span className="bg-slate-800 px-3 py-1 rounded text-sm text-slate-400">#полотно</span>
                                <span className="bg-slate-800 px-3 py-1 rounded text-sm text-slate-400">#олія</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex gap-4">
                            <Button 
                                text="✎ Редагувати" 
                                onClick={handleEditClick}
                                className="bg-slate-700 hover:bg-slate-600 flex-1" 
                            />
                        </div>
                    </div>
                </div>

                {/* БЛОК СЕСІЙ */}
                <div className="border-t border-cherry-900/50 pt-12">
                    <h2 className="text-2xl font-bold text-cherry-500 mb-6">Історія Сесій (Notes)</h2>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center opacity-50 border-dashed">
                        <p className="text-xl mb-2">📜</p>
                        <p>Тут буде історія роботи над картиною: таймер, нотатки, прогрес.</p>
                        <p className="text-sm mt-2 text-cherry-400">Скоро буде...</p>
                    </div>
                </div>

                {/* МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-cherry-900 p-8 rounded-lg max-w-md w-full shadow-2xl animate-fade-in relative">
                            
                            <h2 className="text-2xl font-bold text-cherry-500 mb-6">Редагування</h2>
                            
                            {/* 👇 Якщо є помилка, показуємо її тут червоним */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-900/20 border border-red-900 text-red-400 text-sm rounded">
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <Input 
                                    label="Назва" 
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Опис</label>
                                    <textarea 
                                        rows="4"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Замінити фото (необов'язково)</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setEditForm({...editForm, image: e.target.files[0]})}
                                        className="text-slate-400 text-sm"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button text="Зберегти" className="bg-cherry-700 flex-1" />
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-white px-4 py-2 rounded flex-1 transition"
                                    >
                                        Скасувати
                                    </button>
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