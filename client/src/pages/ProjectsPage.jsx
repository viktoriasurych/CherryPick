import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ConfirmModal';
import DictSelect from '../components/ui/DictSelect';      // Для одного (Жанр, Стиль)
import MultiDictSelect from '../components/ui/MultiDictSelect'; // Для багатьох (Матеріали, Теги)

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Модальне вікно видалення
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Стан для форми створення
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        style_id: '',
        genre_id: '',
        material_ids: [], // Масив
        tag_ids: []       // Масив
    });

    const loadProjects = async () => {
        try {
            setLoading(true);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await artworkService.create(formData);
            
            // Очищення форми
            setFormData({ 
                title: '', description: '', image: null,
                style_id: '', genre_id: '',
                material_ids: [], tag_ids: []
            });
            
            setShowForm(false);
            loadProjects(); 
        } catch (error) {
            alert('Помилка при створенні: ' + error.message);
        }
    };

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
            loadProjects();
        } catch (error) {
            alert('Не вдалося видалити');
        }
    };

    return (
        <div className="p-8"> 
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-cherry-900 pb-4">
                    <h1 className="text-3xl font-bold text-cherry-500">Архів Робіт</h1>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-cherry-700 hover:bg-cherry-800 text-white px-4 py-2 rounded transition"
                    >
                        {showForm ? 'Закрити' : '+ Додати роботу'}
                    </button>
                </div>

                {/* ФОРМА СТВОРЕННЯ */}
                {showForm && (
                    <div className="bg-slate-900 p-6 rounded-lg mb-8 border border-slate-700 animate-fade-in">
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                            <Input 
                                label="Назва" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />

                            {/* БЛОК ВИБОРУ */}
                            <div className="pt-2 border-t border-slate-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <DictSelect 
                                        type="genres" label="Жанр" 
                                        value={formData.genre_id} 
                                        onChange={(val) => setFormData({...formData, genre_id: val})} 
                                    />
                                    <DictSelect 
                                        type="styles" label="Стиль" 
                                        value={formData.style_id} 
                                        onChange={(val) => setFormData({...formData, style_id: val})} 
                                    />
                                </div>
                                
                                <MultiDictSelect 
                                    type="materials" label="Матеріали" 
                                    selectedIds={formData.material_ids} 
                                    onChange={(ids) => setFormData({...formData, material_ids: ids})} 
                                />

                                <MultiDictSelect 
                                    type="tags" label="Теги" 
                                    selectedIds={formData.tag_ids} 
                                    onChange={(ids) => setFormData({...formData, tag_ids: ids})} 
                                />
                            </div>

                            <Input 
                                label="Опис" 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            
                            <input 
                                type="file" 
                                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                className="text-slate-400"
                            />
                            <Button text="Зберегти" className="bg-cherry-700 w-full" />
                        </form>
                    </div>
                )}

                {/* СІТКА ПРОЄКТІВ */}
                {loading ? <p>Завантаження...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(art => (
                            <Link 
                                to={`/projects/${art.id}`} 
                                key={art.id} 
                                className="block bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-cherry-600 transition shadow-lg relative group"
                            >
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
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-cherry-400">{art.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{art.description}</p>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            handleRequestDelete(art.id); 
                                        }}
                                        className="mt-4 text-xs text-red-500 hover:underline z-10 relative"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <ConfirmModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Видалити роботу?"
                    message="Цю дію неможливо скасувати. Проєкт буде видалено з архіву назавжди."
                />
            </div>
        </div>
    );
};

export default ProjectsPage;