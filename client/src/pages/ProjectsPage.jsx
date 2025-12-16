import { useState, useEffect } from 'react';
import artworkService from '../services/artworkService'; // Використовуємо наш сервіс
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Стан для форми
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });

    // 1. Завантаження даних
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

    // 2. Обробка створення
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await artworkService.create(formData);
            
            // Скидаємо форму і оновлюємо список
            setFormData({ title: '', description: '', image: null });
            setShowForm(false);
            loadProjects(); 
        } catch (error) {
            alert('Помилка при створенні: ' + error.message);
        }
    };

    // 3. Обробка видалення
    const handleDelete = async (id) => {
        if(window.confirm("Видалити цей проект?")) {
            try {
                await artworkService.delete(id);
                loadProjects();
            } catch (error) {
                alert('Не вдалося видалити');
            }
        }
    };

    return (
        <div className="min-h-screen bg-vampire-950 text-bone-200 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Хедер */}
                <div className="flex justify-between items-center mb-8 border-b border-cherry-900 pb-4">
                    <h1 className="text-3xl font-bold text-cherry-500">Архів Робіт</h1>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-cherry-700 hover:bg-cherry-800 text-white px-4 py-2 rounded transition"
                    >
                        {showForm ? 'Закрити' : '+ Додати роботу'}
                    </button>
                </div>

                {/* Форма додавання */}
                {showForm && (
                    <div className="bg-slate-900 p-6 rounded-lg mb-8 border border-slate-700 animate-fade-in">
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                            <Input 
                                label="Назва" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
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

                {/* Сітка проєктів */}
                {loading ? <p>Завантаження...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(art => (
                            <div key={art.id} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-cherry-600 transition shadow-lg">
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
                                </div>
                                {/* Інфо */}
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-cherry-400">{art.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{art.description}</p>
                                    <button 
                                        onClick={() => handleDelete(art.id)}
                                        className="mt-4 text-xs text-red-500 hover:underline"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;