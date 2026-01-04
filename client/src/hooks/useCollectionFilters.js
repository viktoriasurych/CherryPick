import { useState, useEffect, useMemo } from 'react';

const useCollectionFilters = (items) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'DESC' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType]);

    const processedItems = useMemo(() => {
        let result = [...items];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => 
                (c.title && c.title.toLowerCase().includes(q)) || 
                (c.author_name && c.author_name.toLowerCase().includes(q))
            );
        }

        if (filterType !== 'ALL') {
            result = result.filter(c => c.type === filterType);
        }

        result.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

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
        processedItems,
        currentItems,
        ITEMS_PER_PAGE
    };
};

export default useCollectionFilters;