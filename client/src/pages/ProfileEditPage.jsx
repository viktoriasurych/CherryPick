import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import EditorLayout from '../components/EditorLayout';
import Input from '../components/ui/Input';
import { PhotoIcon, CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import defaultAvatar from '../assets/default-avatar.png';

const ProfileEditPage = () => {
    const { user, login } = useAuth(); // user беремо тільки для ID та токена
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- STATE ---
    const [formData, setFormData] = useState({
        nickname: '', bio: '', location: '', contact_email: '',
        social_telegram: '', social_instagram: '', social_artstation: '',
        social_behance: '', social_twitter: '', social_website: '',
        // Дефолтні значення (поки не завантажиться з сервера)
        show_global_stats: 1,
        show_kpi_stats: 1,
        show_heatmap_stats: 1
    });

    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
    
    // Початково true, бо ми вантажимо дані
    const [isLoading, setIsLoading] = useState(true); 
    const [hasChanges, setHasChanges] = useState(false);

    // 👇 ГОЛОВНА ЗМІНА: Вантажимо СВІЖІ дані з сервера
    useEffect(() => {
        const loadFreshData = async () => {
            try {
                // 1. Робимо запит до бази за актуальним профілем
                const freshUser = await userService.getProfile();
                
                // 2. Заповнюємо форму свіжими даними
                setFormData({
                    nickname: freshUser.nickname || '',
                    bio: freshUser.bio || '',
                    location: freshUser.location || '',
                    contact_email: freshUser.contact_email || '',
                    social_telegram: freshUser.social_telegram || '',
                    social_instagram: freshUser.social_instagram || '',
                    social_artstation: freshUser.social_artstation || '',
                    social_behance: freshUser.social_behance || '',
                    social_twitter: freshUser.social_twitter || '',
                    social_website: freshUser.social_website || '',
                    
                    // Тепер тут будуть АКТУАЛЬНІ налаштування з бази
                    show_global_stats: freshUser.show_global_stats,
                    show_kpi_stats: freshUser.show_kpi_stats,
                    show_heatmap_stats: freshUser.show_heatmap_stats
                });
            } catch (error) {
                console.error("Не вдалося завантажити профіль:", error);
                // Якщо помилка, пробуємо взяти хоча б з кешу (fallback)
                if (user) {
                    setFormData(prev => ({...prev, nickname: user.nickname})); 
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFreshData();
    }, []); // Пустий масив = викликати один раз при відкритті сторінки

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    // --- HANDLERS ---

    const handleChange = (field, value) => {
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
            setIsLoading(true); // Вмикаємо спінер

            // 1. Оновлюємо дані
            let finalUser = await userService.updateProfile(formData);

            // 2. Логіка фото
            if (pendingAvatar) {
                const avatarResponse = await userService.uploadAvatar(pendingAvatar);
                finalUser = { ...finalUser, avatar_url: avatarResponse.avatar_url };
            } else if (isAvatarDeleted) {
                await userService.deleteAvatar();
                finalUser = { ...finalUser, avatar_url: null };
            }

            // 3. Оновлюємо глобальний стейт
            login(localStorage.getItem('token'), finalUser);
            navigate('/profile'); 
            
        } catch (error) {
            console.error(error);
            alert("Помилка збереження: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // ВІЗУАЛІЗАЦІЯ
    const displayAvatar = previewUrl || (user?.avatar_url && !isAvatarDeleted ? `http://localhost:3000${user.avatar_url}` : defaultAvatar);

    // Якщо дані ще вантажаться, показуємо заглушку (щоб не блимали пусті поля)
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
                    {previewUrl && <span className="text-yellow-500 text-[10px] mt-4 animate-pulse">● Нове фото буде збережено</span>}
                    {isAvatarDeleted && !previewUrl && <span className="text-red-500 text-[10px] mt-4 animate-pulse">● Фото буде видалено після збереження</span>}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Основне</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Нікнейм" value={formData.nickname} onChange={e => handleChange('nickname', e.target.value)} />
                        <Input label="Локація" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1 ml-1">Про себе</label>
                        <textarea className="w-full bg-black border border-slate-800 rounded p-3 text-slate-300 text-sm focus:border-cherry-500 outline-none transition h-32 resize-none" value={formData.bio} onChange={e => handleChange('bio', e.target.value)} />
                    </div>
                </div>

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