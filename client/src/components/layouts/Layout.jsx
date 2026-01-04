import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import artworkService from '../../services/artworkService';
import collectionService from '../../services/collectionService';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

import { useCreateCollection } from '../../hooks/useCreateCollection';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

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

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        refreshSidebarData();
    }, [user, location.pathname]);

    return (
        <div className="min-h-screen bg-transparent flex flex-col text-bone">
            <Header 
                user={user} 
                logout={logout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

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
                <main className={`
                    flex-1 flex flex-col
                    transition-all duration-300
                    ${isSidebarOpen ? 'blur-sm pointer-events-none lg:blur-0 lg:pointer-events-auto' : ''}
                `}>
                    <div className={`flex-1 max-w-325 w-full mx-auto p-4 md:p-8 ${!user ? 'pt-8' : ''}`}>
                        {children}
                    </div>

                    <Footer />
                </main>
            </div>

            <CreateModal />
        </div>
    );
};

export default Layout;