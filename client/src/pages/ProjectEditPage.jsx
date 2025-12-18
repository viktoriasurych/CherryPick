import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ProjectForm from '../components/ProjectForm';

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await artworkService.getById(id);
                setInitialData({
                    ...data,
                    started: { year: data.started_year || '', month: data.started_month || '', day: data.started_day || '' },
                    finished: { year: data.finished_year || '', month: data.finished_month || '', day: data.finished_day || '' },
                    material_ids: Array.isArray(data.material_ids) ? data.material_ids : [],
                    tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
                    style_id: data.style_id || '',
                    genre_id: data.genre_id || ''
                });
                setGallery(data.gallery || []);
            } catch (error) {
                console.error(error);
                navigate('/projects');
            }
        };
        load();
    }, [id, navigate]);

    const handleUpdate = async (formData) => {
        try {
            setLoading(true);
            await artworkService.update(id, formData);
            navigate(`/projects/${id}`);
        } catch (error) {
            alert('Помилка: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetCover = async (imagePath) => {
        if (!window.confirm("Зробити це фото головною обкладинкою проєкту?")) return;
        try {
            setLoading(true);
            await artworkService.update(id, { image: imagePath });
            alert("Обкладинку оновлено!");
            navigate(`/projects/${id}`);
        } catch (error) {
            alert("Помилка: " + error.message);
            setLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (imgId) => {
        if (!window.confirm("Видалити це фото назавжди?")) return;
        try {
            await artworkService.deleteGalleryImage(imgId);
            setGallery(prev => prev.filter(img => img.id !== imgId));
        } catch (error) {
            alert("Помилка видалення");
        }
    };

    if (!initialData) return <div className="text-center p-10 text-slate-500">Завантаження...</div>;

    // 👇 ФОРМУЄМО СПИСОК ДЛЯ ВІДОБРАЖЕННЯ
    // Ми беремо галерею, але переконуємося, що поточна обкладинка там є (візуально)
    const displayGallery = [...gallery];
    
    // Перевіряємо, чи є обкладинка в галереї. Якщо ні - додаємо віртуально для відображення.
    // (Але оскільки ми пофіксили бекенд, вона там має бути, але це страховка)
    const isCoverInGallery = displayGallery.some(img => img.image_path === initialData.image_path);
    
    if (initialData.image_path && !isCoverInGallery) {
        displayGallery.unshift({
            id: 'current_cover_virtual',
            image_path: initialData.image_path,
            isVirtual: true // прапорець, що це не з бази галереї
        });
    }

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <ProjectForm 
                title={`Редагування: ${initialData.title}`} 
                initialData={initialData} 
                onSubmit={handleUpdate} 
                isLoading={loading} 
            />

            <div className="max-w-3xl mx-auto mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl">
                <div className="mb-6">
                    <h3 className="text-xl text-cherry-500 font-bold flex items-center gap-2">
                        📸 Галерея та Обкладинки
                    </h3>
                    <p className="text-slate-500 text-sm">Всі зображення проєкту</p>
                </div>
                
                {/* 👇 ДОДАЛИ СКРОЛ (max-h-96 overflow-y-auto) */}
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {displayGallery.length === 0 ? (
                        <div className="text-slate-500 italic text-center p-8 border border-dashed border-slate-700 rounded bg-slate-950/30">
                            Пусто.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {displayGallery.map(img => {
                                // Перевіряємо, чи це поточна обкладинка
                                const isCurrentCover = img.image_path === initialData.image_path;

                                return (
                                    <div key={img.id} className={`bg-black rounded-lg border overflow-hidden flex flex-col shadow-lg ${isCurrentCover ? 'border-cherry-500 ring-1 ring-cherry-500' : 'border-slate-700'}`}>
                                        <div className="aspect-square relative w-full border-b border-slate-800">
                                            <img 
                                                src={artworkService.getImageUrl(img.image_path)} 
                                                alt="Detail" 
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            {isCurrentCover && (
                                                <div className="absolute top-2 left-2 bg-cherry-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                                                    Активна обкладинка
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-2 bg-slate-900 flex justify-between items-center gap-2">
                                            {/* ЛОГІКА КНОПКИ ОБКЛАДИНКИ */}
                                            {isCurrentCover ? (
                                                <div className="flex-1 text-center py-2 text-xs font-bold text-cherry-400 bg-cherry-900/20 rounded border border-cherry-900/50 cursor-default">
                                                    ★ Поточна
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCover(img.image_path)}
                                                    className="flex-1 bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 py-2 px-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700 hover:border-green-500"
                                                    title="Зробити обкладинкою"
                                                >
                                                    <span>★</span> <span className="hidden min-[400px]:inline">На головну</span>
                                                </button>
                                            )}

                                            {/* Кнопка Видалити */}
                                            {!isCurrentCover && !img.isVirtual && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteGalleryImage(img.id)}
                                                    className="bg-slate-800 hover:bg-red-600 hover:text-white text-red-500 py-2 px-3 rounded font-bold transition border border-slate-700 hover:border-red-500"
                                                    title="Видалити"
                                                >
                                                    🗑
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectEditPage;