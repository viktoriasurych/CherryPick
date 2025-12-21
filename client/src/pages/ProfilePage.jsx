import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import collectionService from '../services/collectionService';
import userService from '../services/userService';
import artworkService from '../services/artworkService';
import Button from '../components/ui/Button';
import StatsSection from '../components/StatsSection'; // 👈 ВАЖЛИВО

import { 
    LinkIcon, EnvelopeIcon, PaperAirplaneIcon, 
    CameraIcon, PaintBrushIcon,
    GlobeAltIcon, LockClosedIcon, Bars2Icon, EyeIcon, EyeSlashIcon
} from '@heroicons/react/24/solid';

// DND Kit
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';

import defaultAvatar from '../assets/default-avatar.png'; 
import defaultCollectionImg from '../assets/default-collection.png';

const ProfilePage = () => {
    const { id } = useParams();
    const { user: currentUser, login } = useAuth();
    
    const [profileUser, setProfileUser] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const isOwner = !id || (currentUser && String(currentUser.id) === String(id));
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                let userData;
                let userCollections;

                if (isOwner) {
                    // 1. Мій профіль
                    userData = await userService.getProfile();
                    
                    // 👇 БУЛО: collectionService.getAll() (Всі підряд)
                    // 👇 СТАЛО: getPublicCollections (Тільки публічні, як для людей)
                    userCollections = await collectionService.getPublicCollections(currentUser.id); 
                } else {
                    // 2. Чужий профіль
                    const res = await api.get(`/users/${id}`); 
                    userData = res.data;
                    userCollections = await collectionService.getPublicCollections(id);
                }

                setProfileUser(userData);
                setCollections(userCollections);
            } catch (error) {
                console.error("Помилка завантаження профілю", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id, isOwner, currentUser?.id]);

    const toggleStatsVisibility = async () => {
        if (!isOwner) return;
        const newValue = !profileUser.show_stats_public;
        setProfileUser(prev => ({ ...prev, show_stats_public: newValue }));

        try {
            await userService.updateProfile({ ...profileUser, show_stats_public: newValue });
            login(localStorage.getItem('token'), { ...currentUser, show_stats_public: newValue });
        } catch (error) {
            console.error("Помилка збереження", error);
            setProfileUser(prev => ({ ...prev, show_stats_public: !newValue }));
        }
    };

    const handleDragEnd = async (event) => {
        if (!isOwner) return;
        const { active, over } = event;
        
        if (active.id !== over.id) {
            setCollections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                
                api.put('/collections/reorder', { items: newOrder.map(c => ({ id: c.id })) });
                return newOrder;
            });
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Завантаження профілю...</div>;
    if (!profileUser) return <div className="text-center py-20 text-red-500">Користувача не знайдено</div>;

    const avatarSrc = profileUser.avatar_url ? `http://localhost:3000${profileUser.avatar_url}` : defaultAvatar;
    const showStats = isOwner || profileUser.show_stats_public;

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* --- ЛІВА КОЛОНКА (Сайдбар) --- */}
                <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-6">
                    <div className="flex flex-col gap-4 text-center lg:text-left">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl mx-auto lg:mx-0 bg-slate-900 shrink-0">
                            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white font-pixel tracking-wide break-words">{profileUser.nickname}</h1>
                            <p className="text-slate-400 text-lg whitespace-pre-wrap break-words">{profileUser.bio || "..."}</p>
                        </div>

                        {isOwner && (
                            <Link to="/profile/edit" className="w-full block">
                                <Button text="Редагувати профіль" className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 justify-center" />
                            </Link>
                        )}

                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
                            {profileUser.social_telegram && <SocialIcon href={`https://t.me/${profileUser.social_telegram.replace('@','')}`} icon={PaperAirplaneIcon} tooltip="Telegram" />}
                            {profileUser.social_instagram && <SocialIcon href={profileUser.social_instagram} icon={CameraIcon} tooltip="Instagram" />}
                            {profileUser.social_artstation && <SocialIcon href={profileUser.social_artstation} text="AS" tooltip="ArtStation" />}
                            {profileUser.social_behance && <SocialIcon href={profileUser.social_behance} icon={PaintBrushIcon} tooltip="Behance" />}
                            {profileUser.social_website && <SocialIcon href={profileUser.social_website} icon={LinkIcon} tooltip="Website" />}
                        </div>
                        
                        {profileUser.contact_email && (
                            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 pt-2 border-t border-slate-800">
                                <EnvelopeIcon className="w-4 h-4"/>
                                <a href={`mailto:${profileUser.contact_email}`} className="hover:text-white transition">{profileUser.contact_email}</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ПРАВА КОЛОНКА (Контент) --- */}
                <div className="lg:col-span-9 space-y-12">
                    
                    {/* 1. СТАТИСТИКА */}
                    <div className="relative group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white font-pixel">Статистика активності</h3>
                            
                            {isOwner && (
                                <button 
                                    onClick={toggleStatsVisibility}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition
                                        ${profileUser.show_stats_public 
                                            ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                                            : 'bg-red-900/20 text-red-400 border-red-900/50'}
                                    `}
                                >
                                    {profileUser.show_stats_public ? <EyeIcon className="w-4 h-4"/> : <EyeSlashIcon className="w-4 h-4"/>}
                                    {profileUser.show_stats_public ? "Публічна" : "Приватна"}
                                </button>
                            )}
                        </div>

                        {showStats ? (
                            <StatsSection userId={profileUser.id} /> // 👈 ВСТАВЛЕНО КОМПОНЕНТ
                        ) : (
                            <div className="bg-slate-900/20 border border-dashed border-slate-800 p-8 rounded-xl text-center text-slate-600 flex flex-col items-center">
                                <LockClosedIcon className="w-8 h-8 mb-2 opacity-50"/>
                                <p>Статистика прихована користувачем.</p>
                            </div>
                        )}
                    </div>

                    {/* 2. ГАЛЕРЕЯ */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white font-pixel">
                                Галерея {isOwner && <span className="text-slate-500 text-sm ml-2 font-sans font-normal opacity-50">(тягніть, щоб змінити порядок)</span>}
                            </h3>
                        </div>

                        {collections.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500">
                                {isOwner ? "Створіть свою першу колекцію!" : "У цього автора ще немає публічних колекцій."}
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={collections.map(c => c.id)} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {collections.map(col => {
                                            const coverSrc = col.cover_image 
                                                ? artworkService.getImageUrl(col.cover_image) 
                                                : (col.latest_image ? artworkService.getImageUrl(col.latest_image) : defaultCollectionImg);

                                            return (
                                                <SortableItem key={col.id} id={col.id} disabled={!isOwner}>
                                                    <div className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cherry-900/50 hover:shadow-xl transition h-full flex flex-col">
                                                        {isOwner && (
                                                            <div className="absolute top-2 right-2 z-10 bg-black/60 p-1.5 rounded cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition">
                                                                <Bars2Icon className="w-5 h-5"/>
                                                            </div>
                                                        )}

                                                        <Link to={`/collections/${col.id}`} className="flex flex-col h-full">
                                                            <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
                                                                <img src={coverSrc} alt={col.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                                                                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white font-bold border border-white/10">
                                                                    {new Date(col.created_at).getFullYear()}
                                                                </div>
                                                                <div className="absolute bottom-2 right-2 bg-cherry-900/80 px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest border border-white/10">
                                                                    {col.type}
                                                                </div>
                                                            </div>

                                                            <div className="p-4 flex flex-col grow">
                                                                <h4 className="font-bold text-white text-lg mb-1 truncate group-hover:text-cherry-400 transition">{col.title}</h4>
                                                                
                                                                {isOwner && (
                                                                    <div className="mb-2">
                                                                        {col.is_public 
                                                                            ? <span className="text-[10px] text-green-500 flex items-center gap-1"><GlobeAltIcon className="w-3 h-3"/> Public</span>
                                                                            : <span className="text-[10px] text-slate-500 flex items-center gap-1"><LockClosedIcon className="w-3 h-3"/> Private</span>
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </SortableItem>
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialIcon = ({ href, icon: Icon, text, tooltip }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        title={tooltip}
        className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition border border-slate-700 shrink-0"
    >
        {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">{text}</span>}
    </a>
);

export default ProfilePage;