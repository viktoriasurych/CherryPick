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
            await artworkService.create(formData);
            navigate('/projects'); // Після успіху йдемо назад до списку
        } catch (error) {
            alert('Помилка: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <ProjectForm 
                title="Новий шедевр ✨" 
                onSubmit={handleCreate} 
                isLoading={loading} 
            />
        </div>
    );
};

export default ProjectCreatePage;