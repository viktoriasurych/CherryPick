import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import artworkService from '../../services/artworkService';
import collectionService from '../../services/collectionService';

// 👇 Імпортуємо наші нові компоненти
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

import { useCreateCollection } from '../../hooks/useCreateCollection';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    
    // Стан для сайдбару
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentCollections, setRecentCollections] = useState([]); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const refreshSidebarData = () => {
        if (user) {
            Promise.all([
                artworkService.getAll({}, { by: 'updated', dir: 'DESC' }),
                collectionService.getAll()
            ]).then(([projects, collections]) => {
                setRecentProjects(projects);
                setRecentCollections(collections);
            }).catch(console.error);
        }
    };

    const { openModal: openCreateCollection, CreateModal } = useCreateCollection(refreshSidebarData);

    // Закриваємо сайдбар при зміні сторінки
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        refreshSidebarData();
    }, [user]);

    return (
        // 👇 ЗМІНА 1: Прибрали 'overflow-hidden'. Тепер сторінка скролиться глобально.
        <div className="min-h-screen bg-transparent flex flex-col text-bone">
            
            {/* 👇 Вставляємо Хедер. Він тепер просто частина потоку, не sticky */}
            <Header 
                user={user} 
                logout={logout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

            {/* 👇 ЗМІНА 2: Прибрали 'overflow-hidden' і тут */}
            <div className="flex flex-1 relative">
                {user && (
                    <Sidebar
                        recentProjects={recentProjects}
                        recentCollections={recentCollections}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        onOpenCollectionModal={openCreateCollection}
                    />
                )}
                
                {user && isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/80 z-30 transition-opacity backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Основний контент + Футер */}
                {/* 👇 ЗМІНА 3: 
                    - Прибрали 'overflow-y-auto' (внутрішній скрол).
                    - Прибрали 'h-[calc(100vh-64px)]' (фіксовану висоту).
                    Тепер main розтягується на всю довжину контенту.
                */}
                <main className={`
                    flex-1 flex flex-col
                    transition-all duration-300
                    ${isSidebarOpen ? 'blur-sm pointer-events-none lg:blur-0 lg:pointer-events-auto' : ''}
                `}>
                    <div className={`flex-1 max-w-[1300px] w-full mx-auto p-4 md:p-8 ${!user ? 'pt-8' : ''}`}>
                        {children}
                    </div>

                    {/* 👇 Вставляємо Футер */}
                    <Footer />
                </main>
            </div>

            <CreateModal />
        </div>
    );
};

export default Layout;