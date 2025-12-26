import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../../services/artworkService';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmModal from '../../components/shared/ConfirmModal'; // Для помилок

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const [gallery, setGallery] = useState([]);
    
    // Стейт для помилок
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

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
                material_ids: data.material_ids || [],
                tag_ids: data.tag_ids || []
            });
            setGallery(data.gallery || []);
        } catch (error) {
            console.error("Load error:", error);
            navigate('/projects'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id, navigate]);

    const handleUpdate = async (formData, deletedGalleryIds) => {
        try {
            setLoading(true);
            await artworkService.update(id, formData);
            
            if (deletedGalleryIds && deletedGalleryIds.length > 0) {
                await Promise.all(
                    deletedGalleryIds.map(imgId => artworkService.deleteGalleryImage(imgId))
                );
            }
            navigate(`/projects/${id}`);
        } catch (error) {
            console.error("Update error:", error);
            setErrorModal({ 
                isOpen: true, 
                message: error.response?.data?.message || error.message 
            });
        } finally {
            setLoading(false);
        }
    };

    // Функція, яку викликає ProjectForm після підтвердження в своїй модалці
    const handleDelete = async () => {
        try {
            setLoading(true);
            await artworkService.delete(id);
            navigate('/projects');
        } catch (error) {
            setLoading(false);
            setErrorModal({ 
                isOpen: true, 
                message: "Failed to delete project: " + error.message 
            });
        }
    };

    if (loading && !initialData) {
        return <div className="text-center p-20 text-muted animate-pulse font-mono uppercase tracking-widest">Summoning Data...</div>;
    }

    return (
        <>
            <ProjectForm 
                title={`Editing: ${initialData?.title}`} 
                initialData={initialData} 
                gallery={gallery}
                onSubmit={handleUpdate} 
                isLoading={loading}
                onDelete={handleDelete}
            />

            {/* Модалка для помилок */}
            <ConfirmModal 
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
                title="System Error"
                message={errorModal.message}
                confirmText="Close"
            />
        </>
    );
};

export default ProjectEditPage;