import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import artworkService from '../../services/artworkService';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmModal from '../../components/shared/ConfirmModal';

const ProjectCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const handleCreate = async (formData) => {
        try {
            setLoading(true);
            const response = await artworkService.create(formData);
            const newId = response.artwork.id;
            navigate(`/projects/${newId}`);
        } catch (error) {
            setLoading(false);
            setErrorModal({ 
                isOpen: true, 
                message: error.response?.data?.message || error.message 
            });
        }
    };

    return (
        <>
            <ProjectForm 
                title="New Masterpiece ✨" 
                onSubmit={handleCreate} 
                isLoading={loading} 
            />

            <ConfirmModal 
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
                title="Creation Failed"
                message={errorModal.message}
                confirmText="Understood"
            />
        </>
    );
};

export default ProjectCreatePage;