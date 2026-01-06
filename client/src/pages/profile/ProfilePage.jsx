import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import collectionService from '../../services/collectionService';
import userService from '../../services/userService';

import StatsSection from '../../components/stats/StatsSection';
import CollectionCard from '../../components/collections/CollectionCard';
import PageTitle from '../../components/shared/PageTitle';
import Loader from '../../components/ui/Loader';
import { SortableItem } from '../../components/ui/SortableItem';

import { getDisplayHandle, getSocialLink } from '../../utils/formatters';

import { MapPinIcon, PencilSquareIcon, EnvelopeIcon, LinkIcon } from '@heroicons/react/24/solid';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import defaultAvatar from '../../assets/default-avatar.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAvatarUrl = (path) => {
    if (!path) return defaultAvatar;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
};

const BRAND_ICONS = {
    telegram: (props) => ( <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> ),
    instagram: (props) => ( <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> ),
    artstation: (props) => ( <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9.462 8.653l-1.07-1.826L1.874 18h3.805l3.783-9.347zm6.06-1.554L13.882 4H9.696l5.826 3.099zm-.713 1.956l-1.28 2.196L10.36 16.5h8.928l-4.48-7.445zm-6.68 6.945h13.238L19.8 18H6.556l1.573-2.585z"/></svg> ),
    behance: (props) => ( <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.167 0-5.625-2.182-5.625-5.977 0-3.578 2.328-5.977 5.625-5.977 2.682 0 4.543 1.422 4.966 3.812h-2.591c-.256-.818-1.162-1.58-2.375-1.58-1.972 0-2.887 1.432-2.887 3.745 0 2.235 1.05 3.745 2.887 3.745 1.487 0 2.296-.988 2.515-1.768h2.586zm-17.726-10c-2.438 0-4.339 2.306-4.339 5.86 0 3.782 2.062 5.86 5.213 5.86 3.037 0 4.908-1.85 4.908-4.522 0-1.851-1.019-3.411-2.924-3.832 1.474-.461 2.455-1.685 2.455-3.321 0-2.725-2.073-4.045-5.313-4.045h-6.273v14h2.249v-4.464h3.047c2.162 0 3.258.986 3.258 2.529 0 1.989-1.503 2.544-3.565 2.544h-2.74v1.89h3.197c2.977 0 5.166-1.666 5.166-4.453 0-1.594-.969-2.935-2.502-3.35 1.343-.451 2.05-1.465 2.05-2.822 0-2.222-1.64-3.151-4.088-3.151h-3.836v4.298h2.903c1.921 0 2.921.651 2.921 2.146 0 1.542-1.229 2.152-3.238 2.152h-2.786z"/></svg> )
};

const ProfilePage = () => {
    const { id } = useParams(); 
    const { user: currentUser } = useAuth();
    
    const [profileUser, setProfileUser] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [activeId, setActiveId] = useState(null);
    
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                let userData;
                if (!id) {
                    userData = await userService.getProfile();
                } else {
                    const res = await api.get(`/users/${id}`); 
                    userData = res.data;
                }
                setProfileUser(userData);
                
                const ownerCheck = !id || (currentUser && String(currentUser.id) === String(userData.id));
                setIsOwner(ownerCheck);
                
                const userCollections = await collectionService.getPublicCollections(userData.id);
                setCollections(userCollections);
            } catch (error) {
                console.error("Profile load error", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id, currentUser?.id]);

    const handlePrivacyChange = (key, value) => {
        setProfileUser(prev => prev ? { ...prev, [key]: value } : prev);
    };

    const handleDragStart = (event) => {
        if (!isOwner) return;
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        if (!isOwner) return;

        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            setCollections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                api.put('/collections/reorder', { items: newOrder.map(c => ({ id: c.id })) });
                return newOrder;
            });
        }
    };

    if (loading) return <Loader />;
    if (!profileUser) return <div className="min-h-screen flex items-center justify-center text-blood font-mono uppercase tracking-widest">User not found in archives</div>;

    const avatarSrc = getAvatarUrl(profileUser.avatar_url);
    const hasSocials = profileUser.social_telegram || profileUser.social_instagram || profileUser.social_artstation || profileUser.social_behance || profileUser.social_website;

    return (
        <div className="max-w-480 mx-auto pb-20 px-4 md:px-8 font-mono">
            <PageTitle title={isOwner ? "My Space" : `@${profileUser.nickname}`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
                
                {/* Інформація про художника */}
                <div className="lg:col-span-3 h-fit space-y-8 animate-in slide-in-from-left duration-700">
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        
                        <div className="flex flex-col gap-6 items-center lg:items-start">
                            <div className="w-56 h-56 md:w-64 md:h-64 rounded-sm border border-border overflow-hidden shadow-2xl bg-void shrink-0 relative group">
                                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            
                            <div className="space-y-2 w-full">
                                <h1 className="text-3xl font-bold text-bone font-gothic tracking-wide wrap-break-word leading-tight">
                                    {profileUser.display_name || profileUser.nickname}
                                </h1>
                                <p className="text-blood font-bold text-sm tracking-tighter">
                                    @{profileUser.nickname}
                                </p>
                                {profileUser.location && (
                                    <p className="text-muted text-xs flex items-center justify-center lg:justify-start gap-1.5 mt-2 uppercase tracking-wider">
                                        <MapPinIcon className="w-3 h-3 text-blood shrink-0" />
                                        {profileUser.location}
                                    </p>
                                )}
                            </div>

                            {profileUser.bio && (
                                <p className="text-bone/80 text-xs leading-relaxed whitespace-pre-wrap font-mono wrap-break-word text-center lg:text-left w-full">
                                    {profileUser.bio}
                                </p>
                            )}
                        </div>

                        {(profileUser.contact_email || hasSocials) && (
                            <div className="border-t border-border/30 w-full my-2"></div>
                        )}

                        <div className="space-y-8 w-full">
                            {profileUser.contact_email && (
                                <div>
                                    <SectionTitle title="Contact" />
                                    <a href={`mailto:${profileUser.contact_email}`} className="flex items-center gap-3 p-2 rounded-sm border border-border/50 bg-ash/20 hover:bg-ash/40 hover:border-blood/50 transition-all group min-w-0">
                                        <div className="w-8 h-8 flex items-center justify-center bg-void border border-border rounded-sm text-blood group-hover:scale-110 transition-transform shrink-0">
                                            <EnvelopeIcon className="w-4 h-4"/>
                                        </div>
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <span className="text-[10px] text-bone font-mono truncate">{profileUser.contact_email}</span>
                                        </div>
                                    </a>
                                </div>
                            )}

                            {hasSocials && (
                                <div>
                                    <SectionTitle title="Socials" />
                                    <div className="flex flex-col gap-2">
                                        {profileUser.social_telegram && <SocialRow href={getSocialLink('telegram', profileUser.social_telegram)} icon={BRAND_ICONS.telegram} label="Telegram" value={getDisplayHandle(profileUser.social_telegram)} />}
                                        {profileUser.social_instagram && <SocialRow href={getSocialLink('instagram', profileUser.social_instagram)} icon={BRAND_ICONS.instagram} label="Instagram" value={getDisplayHandle(profileUser.social_instagram)} />}
                                        {profileUser.social_artstation && <SocialRow href={getSocialLink('artstation', profileUser.social_artstation)} icon={BRAND_ICONS.artstation} label="ArtStation" value={getDisplayHandle(profileUser.social_artstation)} />}
                                        {profileUser.social_behance && <SocialRow href={getSocialLink('behance', profileUser.social_behance)} icon={BRAND_ICONS.behance} label="Behance" value={getDisplayHandle(profileUser.social_behance)} />}
                                        {profileUser.social_website && <SocialRow href={getSocialLink('website', profileUser.social_website)} icon={LinkIcon} label="Website" value={getDisplayHandle(profileUser.social_website)} />}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isOwner && (
                            <Link to="/profile/edit" className="block w-full pt-4">
                                <button className="w-full flex items-center justify-center gap-2 bg-ash border border-border hover:border-blood text-bone py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all group shadow-lg shadow-black/50 hover:bg-void">
                                    <PencilSquareIcon className="w-4 h-4 text-blood group-hover:scale-110 transition-transform" />
                                    Edit Artwork
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Права частина: Статистика та Галерея */}
                <div className="lg:col-span-9 space-y-16 animate-in slide-in-from-bottom duration-700 delay-200">
                    <StatsSection 
                        userId={profileUser.id} 
                        isOwner={isOwner}
                        privacySettings={{
                            show_global_stats: Boolean(profileUser.show_global_stats),
                            show_kpi_stats: Boolean(profileUser.show_kpi_stats),
                            show_heatmap_stats: Boolean(profileUser.show_heatmap_stats)
                        }}
                        onPrivacyChange={handlePrivacyChange}
                    />

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-4">
                            <h3 className="text-2xl font-bold text-bone font-gothic tracking-widest uppercase flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blood/80 rounded-sm"></span>
                                Exhibition Gallery
                            </h3>
                            {isOwner && collections.length > 0 && (
                                <span className="text-[10px] text-muted uppercase tracking-[0.2em] animate-pulse">
                                    ● Drag to reorder
                                </span>
                            )}
                        </div>

                        {collections.length === 0 ? (
                            <div className="text-center py-24 bg-ash/10 border border-dashed border-border rounded-sm">
                                <p className="text-muted text-xs uppercase tracking-widest font-bold">
                                    {isOwner ? "Your archives are empty." : "No public collections yet."}
                                </p>
                                {isOwner && (
                                    <Link to="/collections" className="text-blood hover:text-white text-xs uppercase underline tracking-widest font-bold mt-2 inline-block">
                                        Create New
                                    </Link>
                                )}
                            </div>
                        ) : (
                            !isOwner ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {collections.map(col => (
                                        <div key={col.id} className="h-full hover:scale-[1.02] transition-transform duration-300">
                                            <CollectionCard collection={col} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <DndContext 
                                    sensors={sensors} 
                                    collisionDetection={closestCenter} 
                                    onDragStart={handleDragStart} 
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={collections.map(c => c.id)} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                            {collections.map(col => (
                                                <SortableItem key={col.id} id={col.id} disabled={false}>
                                                    <div className={`h-full transition-all duration-300 ${activeId === col.id ? 'opacity-30' : 'hover:scale-[1.02]'}`}>
                                                        <CollectionCard collection={col} />
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </div>
                                    </SortableContext>

                                    <DragOverlay>
                                        {activeId ? (
                                            <div className="w-full h-full cursor-grabbing shadow-2xl scale-105 rotate-2">
                                                <CollectionCard collection={collections.find(c => c.id === activeId)} />
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }) => (
    <h4 className="text-[9px] text-muted uppercase tracking-[0.25em] font-bold text-left mb-3 pl-1">
        {title}
    </h4>
);

const SocialRow = ({ href, icon: Icon, label, value }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-sm border border-transparent hover:bg-ash/30 hover:border-border/50 transition-all group min-w-0">
        <div className="w-8 h-8 flex items-center justify-center bg-void border border-border rounded-sm text-muted group-hover:text-bone group-hover:border-blood transition-colors shrink-0">
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
            <span className="text-[8px] text-muted uppercase tracking-widest font-bold group-hover:text-blood transition-colors">{label}</span>
            <span className="text-[10px] text-bone font-mono truncate group-hover:text-white transition-colors">{value}</span>
        </div>
    </a>
);

export default ProfilePage;