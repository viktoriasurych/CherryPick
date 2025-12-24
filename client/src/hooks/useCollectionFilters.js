import { useState, useEffect, useMemo } from 'react';

const useCollectionFilters = (items) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    // Можна передати initialSort в хук, якщо треба різний дефолт
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'DESC' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // Скидаємо сторінку при зміні фільтрів
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType]);

    const processedItems = useMemo(() => {
        let result = [...items];

        // 1. Пошук
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => 
                (c.title && c.title.toLowerCase().includes(q)) || 
                (c.author_name && c.author_name.toLowerCase().includes(q))
            );
        }

        // 2. Фільтр
        if (filterType !== 'ALL') {
            result = result.filter(c => c.type === filterType);
        }

        // 3. Сортування
        result.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Обробка дат (created_at, saved_at)
            if (sortConfig.key.includes('at')) {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortConfig.dir === 'ASC' ? -1 : 1;
            if (valA > valB) return sortConfig.dir === 'ASC' ? 1 : -1;
            return 0;
        });

        return result;
    }, [items, search, filterType, sortConfig]);

    const currentItems = processedItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return {
        search, setSearch,
        filterType, setFilterType,
        sortConfig, setSortConfig,
        currentPage, setCurrentPage,
        processedItems, // Весь список (для count)
        currentItems,   // Тільки для поточної сторінки
        ITEMS_PER_PAGE
    };
};

export default useCollectionFilters;