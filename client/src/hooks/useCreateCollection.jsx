import { useState } from 'react';
import collectionService from '../services/collectionService';
import CollectionCreateModal from '../components/collections/CollectionCreateModal';

/**
 * Хук для створення колекції.
 * @param {Function} onSuccess - функція, яка виконається після успішного створення (наприклад, оновлення списку)
 */
export const useCreateCollection = (onSuccess) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleCreate = async (newCollectionData) => {
        try {
            await collectionService.create(newCollectionData);
            
            // Якщо передали функцію оновлення, викликаємо її
            if (onSuccess) {
                onSuccess(); 
            }
            
            closeModal();
        } catch (error) {
            console.error("Помилка створення колекції:", error);
            // Тут можна додати toast-повідомлення
        }
    };

    // Повертаємо функцію відкриття і КОМПОНЕНТ (вже налаштований)
    const CreateModal = () => (
        <CollectionCreateModal 
            isOpen={isOpen} 
            onClose={closeModal} 
            onCreate={handleCreate} 
        />
    );

    return { openModal, CreateModal };
};