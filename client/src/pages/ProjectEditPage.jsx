import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ProjectForm from '../components/ProjectForm';

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Стан
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const [gallery, setGallery] = useState([]);

    // Завантаження даних при відкритті сторінки
    const loadData = async () => {
        try {
            const data = await artworkService.getById(id);
            
            // Форматуємо дані для форми, замінюючи null на пусті рядки/масиви
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
            
            // Зберігаємо галерею окремо
            setGallery(data.gallery || []);
            
        } catch (error) {
            console.error("Помилка завантаження проєкту:", error);
            navigate('/projects'); // Якщо не знайшли, повертаємось до списку
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id, navigate]);

    // 👇 ОНОВЛЕНИЙ МЕТОД: Приймає formData і deletedGalleryIds
    const handleUpdate = async (formData, deletedGalleryIds) => {
        try {
            setLoading(true);
            
            // КРОК 1: Спочатку оновлюємо основні дані проєкту (Текст, статус, обкладинку)
            // Сервіс сам розбереться, чи це JSON, чи FormData (якщо є новий файл)
            await artworkService.update(id, formData);
            
            // КРОК 2: Якщо крок 1 успішний, видаляємо фото з галереї, які були відмічені
            if (deletedGalleryIds && deletedGalleryIds.length > 0) {
                console.log("Видаляємо фото з галереї:", deletedGalleryIds);
                // Виконуємо всі запити на видалення паралельно за допомогою Promise.all
                await Promise.all(
                    deletedGalleryIds.map(imgId => artworkService.deleteGalleryImage(imgId))
                );
            }
            
            // КРОК 3: Якщо все успішно — переходимо на сторінку перегляду
            navigate(`/projects/${id}`);
            
        } catch (error) {
            console.error("Помилка при оновленні:", error);
            alert('Помилка збереження: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Видалення всього проєкту
    const handleDelete = async () => {
        if (!window.confirm("УВАГА! Видалити цей проєкт назавжди? Цю дію не можна відмінити.")) return;
        try {
            setLoading(true);
            await artworkService.delete(id);
            navigate('/projects'); // Після видалення йдемо в архів
        } catch (error) {
            alert("Помилка видалення проєкту: " + error.message);
            setLoading(false);
        }
    };

    if (loading && !initialData) {
        return <div className="text-center p-20 text-slate-500 animate-pulse">Завантаження даних проєкту...</div>;
    }

    return (
        <ProjectForm 
            title={`Редагування: ${initialData?.title}`} 
            initialData={initialData} 
            gallery={gallery}
            onSubmit={handleUpdate} // Передаємо нашу нову функцію оновлення
            isLoading={loading}
            onDelete={handleDelete}
        />
    );
};

export default ProjectEditPage;