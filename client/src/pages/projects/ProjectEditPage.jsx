import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import artworkService from '../../services/artworkService';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmModal from '../../components/shared/ConfirmModal'; 
import Loader from '../../components/ui/Loader';
import PageTitle from '../../components/shared/PageTitle';

const ProjectEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [initialData, setInitialData] = useState(null);
    const [gallery, setGallery] = useState([]);
    
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const loadData = async () => {
        try {
            setIsLoadingData(true);
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
            setIsLoadingData(false);
        }
    };

    useEffect(() => { loadData(); }, [id, navigate]);

    const handleUpdate = async (formData, deletedGalleryIds) => {
        try {
            setIsSaving(true);
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
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSaving(true);
            await artworkService.delete(id);
            navigate('/projects');
        } catch (error) {
            setIsSaving(false);
            setErrorModal({ 
                isOpen: true, 
                message: "Failed to delete project: " + error.message 
            });
        }
    };
    if (isLoadingData) {
        return <Loader />;
    }

    if (!initialData) return null;

    return (
        <>
            <PageTitle title={`Edit | ${initialData.title}`} />

            <ProjectForm 
                title={`Editing: ${initialData.title}`} 
                initialData={initialData} 
                gallery={gallery}
                onSubmit={handleUpdate} 
                isLoading={isSaving}
                onDelete={handleDelete}
            />

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