import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import collectionService from '../services/collectionService';
import userService from '../services/userService';
import Button from '../components/ui/Button';
import StatsSection from '../components/StatsSection'; 
import CollectionCard from '../components/CollectionCard'; 

import { 
    LinkIcon, EnvelopeIcon, PaperAirplaneIcon, 
    CameraIcon, PaintBrushIcon
} from '@heroicons/react/24/solid';

import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';

import defaultAvatar from '../assets/default-avatar.png'; 

const ProfilePage = () => {
    // id може бути undefined (якщо /profile) або рядок (якщо /user/viky_sia)
    const { id } = useParams(); 
    const { user: currentUser } = useAuth();
    
    const [profileUser, setProfileUser] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 👇 ЗМІНА 1: Робимо isOwner стейтом, бо ми дізнаємося правду тільки після завантаження даних
    const [isOwner, setIsOwner] = useState(false);
    
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                let userData;
                let userCollections;

                // 1. Завантажуємо ДАНІ ПРОФІЛЮ
                if (!id) {
                    // Якщо ми на /profile
                    userData = await userService.getProfile();
                } else {
                    // Якщо ми на /user/..., робимо запит (сервер знайде по ID або Ніку)
                    const res = await api.get(`/users/${id}`); 
                    userData = res.data;
                }

                // 2. Встановлюємо дані користувача
                setProfileUser(userData);

                // 👇 ЗМІНА 2: Визначаємо власника ТУТ, коли маємо userData
                // Це працюватиме і для ID, і для Нікнейму
                const ownerCheck = !id || (currentUser && String(currentUser.id) === String(userData.id));
                setIsOwner(ownerCheck);

                // 3. Завантажуємо колекції цього користувача
                // Якщо це власник, можна було б вантажити і приватні, але для профілю беремо публічні
                userCollections = await collectionService.getPublicCollections(userData.id);
                setCollections(userCollections);

            } catch (error) {
                console.error("Помилка завантаження профілю", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id, currentUser?.id]); // Залежність від зміни ID в URL

    const handlePrivacyChange = (newSettings) => {
        setProfileUser(prev => ({ ...prev, ...newSettings }));
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

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* === ЛІВА КОЛОНКА === */}
                <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-6">
                    <div className="flex flex-col gap-4 text-center lg:text-left">
                        
                        {/* Аватар */}
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl mx-auto lg:mx-0 bg-slate-900 shrink-0">
                            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="space-y-1">
                            {/* ІМ'Я (Display Name) */}
                            <h1 className="text-3xl font-bold text-white font-pixel tracking-wide break-words">
                                {profileUser.display_name || profileUser.nickname}
                            </h1>
                            
                            {/* НІКНЕЙМ (Handle) */}
                            <p className="text-cherry-500 font-mono text-sm break-all">
                                @{profileUser.nickname}
                            </p>

                            <p className="text-slate-400 text-lg whitespace-pre-wrap break-words pt-2">{profileUser.bio || "..."}</p>
                            <p className="text-slate-500 text-sm whitespace-pre-wrap break-words">{profileUser.location || "..."}</p>
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

                {/* === ПРАВА КОЛОНКА === */}
                <div className="lg:col-span-9 space-y-12">
                    <StatsSection 
                        userId={profileUser.id} 
                        isOwner={isOwner}
                        privacySettings={{
                            show_global_stats: profileUser.show_global_stats ?? true,
                            show_kpi_stats: profileUser.show_kpi_stats ?? true,
                            show_heatmap_stats: profileUser.show_heatmap_stats ?? true
                        }}
                        onPrivacyChange={handlePrivacyChange}
                    />

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
                                        {collections.map(col => (
                                            <SortableItem key={col.id} id={col.id} disabled={!isOwner}>
                                                <div className="h-full">
                                                    <CollectionCard collection={col} />
                                                </div>
                                            </SortableItem>
                                        ))}
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