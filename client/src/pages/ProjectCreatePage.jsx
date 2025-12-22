import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import artworkService from '../services/artworkService';
import ProjectForm from '../components/ProjectForm';

const ProjectCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreate = async (formData) => {
        try {
            setLoading(true);
            
            // Створюємо проект і отримуємо відповідь
            const response = await artworkService.create(formData);
            
            // Витягуємо ID нового проекту з відповіді (response.artwork.id)
            const newId = response.artwork.id;
            
            // Переходимо на сторінку перегляду
            navigate(`/projects/${newId}`);
        } catch (error) {
            alert('Помилка: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <ProjectForm 
            title="Новий шедевр ✨" 
            onSubmit={handleCreate} 
            isLoading={loading} 
        />
    );
};

export default ProjectCreatePage;