import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ProjectForm from '../components/ProjectForm';

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

    // 1. Завантажуємо дані
    useEffect(() => {
        const load = async () => {
            try {
                const data = await artworkService.getById(id);
                
                // 👇 КРИТИЧНИЙ МОМЕНТ: Парсимо дані перед передачею у форму
                setInitialData({
                    ...data,
                    // Перетворюємо плоскі дати в об'єкти
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
                    // Переконуємось, що масиви - це масиви (навіть якщо з бази прийшло null)
                    material_ids: Array.isArray(data.material_ids) ? data.material_ids : [],
                    tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
                    
                    // Переконуємось, що ID стилю/жанру не null (інакше Controlled Input лається)
                    style_id: data.style_id || '',
                    genre_id: data.genre_id || ''
                });
            } catch (error) {
                console.error(error);
                navigate('/projects');
            }
        };
        load();
    }, [id, navigate]);

    // 2. Зберігаємо
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

    if (!initialData) return <div className="text-center p-10 text-slate-500">Завантаження досьє...</div>;

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <ProjectForm 
                title={`Редагування: ${initialData.title}`} 
                initialData={initialData} 
                onSubmit={handleUpdate} 
                isLoading={loading} 
            />
        </div>
    );
};

export default ProjectEditPage;