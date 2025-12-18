import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ConfirmModal from '../components/ConfirmModal';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Модалка видалення
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const loadProjects = async () => {
        try {
            setLoading(true);
            // Більше не передаємо фільтри, просто беремо все
            const data = await artworkService.getAll();
            setProjects(data);
        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    // Логіка видалення
    const handleRequestDelete = (id) => {
        setProjectToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await artworkService.delete(projectToDelete);
            setDeleteModalOpen(false);
            setProjectToDelete(null);
            loadProjects(); // Оновлюємо список після видалення
        } catch (error) {
            alert('Не вдалося видалити');
        }
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="max-w-6xl mx-auto">
                
                {/* Хедер */}
                <div className="flex justify-between items-center mb-8 border-b border-cherry-900 pb-4">
                    <h1 className="text-3xl font-bold text-cherry-500">Архів Робіт</h1>
                    
                    {/* Кнопка веде на окрему сторінку створення */}
                    <Link 
                        to="/projects/new" 
                        className="bg-cherry-700 hover:bg-cherry-800 text-white px-4 py-2 rounded transition shadow-lg shadow-cherry-900/20 flex items-center gap-2"
                    >
                        <span>+</span> Додати роботу
                    </Link>
                </div>

                {/* Сітка проєктів */}
                {loading ? (
                    <div className="text-center text-slate-500 py-10">Завантаження архіву...</div>
                ) : (
                    <>
                        {projects.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                                <p className="text-slate-500 text-xl mb-4">Архів порожній 🕸️</p>
                                <Link to="/projects/new" className="text-cherry-500 hover:underline">
                                    Створити перший шедевр
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(art => (
                                    <Link 
                                        to={`/projects/${art.id}`} 
                                        key={art.id} 
                                        className="block bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-cherry-600 transition shadow-lg relative group"
                                    >
                                        {/* Картинка */}
                                        <div className="h-48 bg-black relative">
                                            {art.image_path ? (
                                                <img 
                                                    src={artworkService.getImageUrl(art.image_path)} 
                                                    alt={art.title} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                            )}
                                            
                                            {/* Статус бейдж */}
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-slate-700">
                                                {art.status}
                                            </div>
                                        </div>

                                        {/* Інфо */}
                                        <div className="p-4">
                                            <h3 className="text-xl font-bold text-cherry-400 truncate">{art.title}</h3>
                                            
                                            <div className="flex gap-2 mt-2 text-xs text-slate-500">
                                                <span>{art.genre_name || 'Без жанру'}</span>
                                                <span>•</span>
                                                {/* Показуємо рік початку або рік створення */}
                                                <span>{art.started_year || new Date(art.created_date).getFullYear()}</span>
                                            </div>

                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault(); // Щоб не переходило на сторінку при кліку на видалити
                                                    handleRequestDelete(art.id); 
                                                }} 
                                                className="mt-4 text-xs text-red-500 hover:underline relative z-10"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <ConfirmModal 
                    isOpen={isDeleteModalOpen} 
                    onClose={() => setDeleteModalOpen(false)} 
                    onConfirm={confirmDelete} 
                    title="Видалити роботу?" 
                    message="Цю дію неможливо скасувати. Проєкт буде видалено назавжди." 
                />
            </div>
        </div>
    );
};

export default ProjectsPage;