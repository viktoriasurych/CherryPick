import { useState } from 'react';
import collectionService from '../services/collectionService';
import CollectionCreateModal from '../components/collections/CollectionCreateModal';

export const useCreateCollection = (onSuccess) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleCreate = async (newCollectionData) => {
        try {
            await collectionService.create(newCollectionData);
            if (onSuccess) {
                onSuccess(); 
            }
            
            closeModal();
        } catch (error) {
            console.error("Помилка створення колекції:", error);
        }
    };

    const CreateModal = () => (
        <CollectionCreateModal 
            isOpen={isOpen} 
            onClose={closeModal} 
            onCreate={handleCreate} 
        />
    );

    return { openModal, CreateModal };
};