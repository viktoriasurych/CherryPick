import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ProjectForm from '../components/ProjectForm';

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const [gallery, setGallery] = useState([]);

    const loadData = async () => {
        try {
            const data = await artworkService.getById(id);
            setInitialData({
                ...data,
                started: { 
                    year: data.started_year || '', 
                    month: data.started_month || '', 
                    day: data.started_day || '' 
                },
                finished: { 
                    year: data.finished_year || '', 
                    month: data.finished_month || '', 
                    day: data.finished_day || '' 
                },
                // Гарантуємо, що це масиви
                material_ids: data.material_ids || [],
                tag_ids: data.tag_ids || []
            });
            setGallery(data.gallery || []);
        } catch (error) {
            console.error(error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id, navigate]);

    const handleUpdate = async (formData) => {
        try {
            setLoading(true);
            
            // Ми передаємо звичайний JS-об'єкт.
            // Сервіс сам перетворить його у FormData.
            await artworkService.update(id, formData);
            
            // 👇 Якщо помилки не було, йдемо на сторінку перегляду
            navigate(`/projects/${id}`);
            
        } catch (error) {
            // Якщо сервер повернув помилку (наприклад null data), ми побачимо це тут
            alert('Помилка збереження: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Видалити цей проєкт назавжди?")) return;
        try {
            await artworkService.delete(id);
            navigate('/projects');
        } catch (error) {
            alert("Помилка видалення");
        }
    };

    const handleSetCover = async (imagePath) => {
        if (!window.confirm("Зробити це фото головною обкладинкою?")) return;
        try {
            setLoading(true);
            
            // 👇 Ми явно кажемо: ось image_path
            await artworkService.update(id, { 
                image_path: imagePath 
            });

            alert("Обкладинку оновлено!");
            await loadData(); // Оновлюємо картинку на екрані
        } catch (error) {
            alert("Помилка: " + error.message);
        } finally {
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

    if (!initialData && loading) return <div className="text-center p-20 text-slate-500">Завантаження...</div>;

    return (
        <ProjectForm 
            title={`Редагування: ${initialData?.title}`} 
            initialData={initialData} 
            gallery={gallery}
            onSubmit={handleUpdate} 
            isLoading={loading}
            onDelete={handleDelete}
            onSetCover={handleSetCover}
            onDeleteGalleryImage={handleDeleteGalleryImage}
        />
    );
};

export default ProjectEditPage;