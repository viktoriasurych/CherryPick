import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';

// 👇 EditorLayout лежить у components/layouts
import EditorLayout from '../../components/layouts/EditorLayout';

import Input from '../../components/ui/Input';
import { PhotoIcon, CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';

// 👇 Ассет
import defaultAvatar from '../../assets/default-avatar.png';

import RULES from '../../config/validationRules.json';

const ProfileEditPage = () => {
    const { user, login } = useAuth(); 
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- STATE ---
    const [formData, setFormData] = useState({
        nickname: '', 
        display_name: '', // 👈 2. Додали нове поле
        bio: '', location: '', contact_email: '',
        social_telegram: '', social_instagram: '', social_artstation: '',
        social_behance: '', social_twitter: '', social_website: '',
        show_global_stats: 1,
        show_kpi_stats: 1,
        show_heatmap_stats: 1
    });

    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true); 
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const loadFreshData = async () => {
            try {
                const freshUser = await userService.getProfile();
                
                setFormData({
                    nickname: freshUser.nickname || '',
                    // 👇 3. Завантажуємо ім'я (якщо його немає, беремо нік як дефолт)
                    display_name: freshUser.display_name || freshUser.nickname || '',
                    bio: freshUser.bio || '',
                    location: freshUser.location || '',
                    contact_email: freshUser.contact_email || '',
                    social_telegram: freshUser.social_telegram || '',
                    social_instagram: freshUser.social_instagram || '',
                    social_artstation: freshUser.social_artstation || '',
                    social_behance: freshUser.social_behance || '',
                    social_twitter: freshUser.social_twitter || '',
                    social_website: freshUser.social_website || '',
                    
                    show_global_stats: freshUser.show_global_stats,
                    show_kpi_stats: freshUser.show_kpi_stats,
                    show_heatmap_stats: freshUser.show_heatmap_stats
                });
            } catch (error) {
                console.error("Не вдалося завантажити профіль:", error);
                if (user) {
                    setFormData(prev => ({...prev, nickname: user.nickname})); 
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFreshData();
    }, []); 

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    // --- HANDLERS ---

    const handleChange = (field, value) => {
        // Якщо це нікнейм - видаляємо пробіли відразу
        if (field === 'nickname') {
            value = value.replace(/\s/g, '');
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPendingAvatar(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsAvatarDeleted(false);
        setHasChanges(true);
    };

    const handleDeleteAvatar = () => {
        setIsAvatarDeleted(true);
        setPendingAvatar(null);
        setPreviewUrl(null);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Валідація нікнейму на клієнті
            if (formData.nickname.length < RULES.USER.NICKNAME.MIN) {
                alert(`Нікнейм має бути мінімум ${RULES.USER.NICKNAME.MIN} символи`);
                setIsLoading(false);
                return;
            }

            let finalUser = await userService.updateProfile(formData);

            if (pendingAvatar) {
                const avatarResponse = await userService.uploadAvatar(pendingAvatar);
                finalUser = { ...finalUser, avatar_url: avatarResponse.avatar_url };
            } else if (isAvatarDeleted) {
                await userService.deleteAvatar();
                finalUser = { ...finalUser, avatar_url: null };
            }

            login(localStorage.getItem('token'), finalUser);
            navigate('/profile'); 
            
        } catch (error) {
            console.error(error);
            alert("Помилка збереження: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const displayAvatar = previewUrl || (user?.avatar_url && !isAvatarDeleted ? `http://localhost:3000${user.avatar_url}` : defaultAvatar);

    if (isLoading && !formData.nickname) {
        return <div className="text-center py-20 text-slate-500 animate-pulse">Завантаження даних...</div>;
    }

    return (
        <EditorLayout
            title="Редагування профілю"
            backLink="/profile"
            isSaving={isLoading}
            hasChanges={hasChanges}
            onSave={handleSave}
        >
            <div className="lg:col-span-1 space-y-6">
                 {/* ... Блок аватара без змін ... */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 w-full text-left">Аватар</h3>
                    
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl mb-6 relative group">
                        <img src={displayAvatar} alt="Avatar Preview" className="w-full h-full object-cover"/>
                        <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                            <PhotoIcon className="w-10 h-10 text-white opacity-80" />
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <button onClick={() => fileInputRef.current.click()} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition border border-slate-700">
                            <CloudArrowUpIcon className="w-4 h-4 text-cherry-500"/> Завантажити фото
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*"/>

                        {((user?.avatar_url && !isAvatarDeleted) || previewUrl) && (
                            <button onClick={handleDeleteAvatar} className="w-full text-red-500 hover:text-red-400 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition opacity-70 hover:opacity-100">
                                <TrashIcon className="w-4 h-4"/> {previewUrl ? "Скасувати вибір" : "Видалити фото"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Основне</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 👇 4. ПОЛЕ ДЛЯ ІМЕНІ */}
                        <Input 
                            label="Ім'я (відображається)" 
                            value={formData.display_name} 
                            onChange={e => handleChange('display_name', e.target.value)} 
                            maxLength={RULES.USER.DISPLAY_NAME?.MAX || 50}
                            placeholder="Наприклад: Вікторія Арт 🎨"
                        />
                        
                        {/* 👇 5. ПОЛЕ ДЛЯ НІКНЕЙМУ */}
                        <Input 
                            label="Нікнейм (унікальний ID)" 
                            value={formData.nickname} 
                            onChange={e => handleChange('nickname', e.target.value)} 
                            maxLength={RULES.USER.NICKNAME.MAX}
                            placeholder="viky_sia"
                            hint="Тільки латиниця, цифри та '_'"
                        />
                    </div>

                    <div>
                        <Input label="Локація" value={formData.location} onChange={e => handleChange('location', e.target.value)} maxLength={RULES.USER.LOCATION.MAX} />
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 ml-1">Про себе</label>
                            <span className="text-[10px] text-slate-600">{formData.bio.length} / {RULES.USER.BIO.MAX}</span>
                        </div>
                        <textarea 
                            className="w-full bg-black border border-slate-800 rounded p-3 text-slate-300 text-sm focus:border-cherry-500 outline-none transition h-32 resize-none" 
                            value={formData.bio} 
                            onChange={e => handleChange('bio', e.target.value)} 
                            maxLength={RULES.USER.BIO.MAX}
                        />
                    </div>
                </div>

                {/* ... Контакти та соцмережі без змін ... */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-cherry-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Контакти</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Email для зв'язку" value={formData.contact_email} onChange={e => handleChange('contact_email', e.target.value)} />
                            <Input label="Telegram" value={formData.social_telegram} onChange={e => handleChange('social_telegram', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-cherry-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Соціальні мережі</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Instagram" value={formData.social_instagram} onChange={e => handleChange('social_instagram', e.target.value)} />
                            <Input label="ArtStation" value={formData.social_artstation} onChange={e => handleChange('social_artstation', e.target.value)} />
                            <Input label="Behance" value={formData.social_behance} onChange={e => handleChange('social_behance', e.target.value)} />
                            <Input label="Twitter / X" value={formData.social_twitter} onChange={e => handleChange('social_twitter', e.target.value)} />
                            <div className="md:col-span-2">
                                <Input label="Особистий сайт" value={formData.social_website} onChange={e => handleChange('social_website', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EditorLayout>
    );
};

export default ProfileEditPage;