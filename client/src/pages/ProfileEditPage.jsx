import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// 👇 ЗАМІСТЬ api ІМПОРТУЄМО СЕРВІС
import userService from '../services/userService'; 
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { TrashIcon, ArrowUpTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import defaultAvatar from '../assets/default-avatar.png';

const ProfileEditPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Дані форми
    const [formData, setFormData] = useState({
        nickname: '', bio: '', location: '', contact_email: '',
        social_telegram: '', social_instagram: '', social_artstation: '',
        social_behance: '', social_twitter: '', social_website: ''
    });

    // Стейт для фото
    const [selectedFile, setSelectedFile] = useState(null); 
    const [preview, setPreview] = useState(null);           

    useEffect(() => {
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                bio: user.bio || '',
                location: user.location || '',
                contact_email: user.contact_email || '',
                social_telegram: user.social_telegram || '',
                social_instagram: user.social_instagram || '',
                social_artstation: user.social_artstation || '',
                social_behance: user.social_behance || '',
                social_twitter: user.social_twitter || '',
                social_website: user.social_website || ''
            });
        }
    }, [user]);

    // Вибір файлу (тільки прев'ю)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    // ЗБЕРЕГТИ ВСЕ
    const handleSave = async () => {
        try {
            let updatedUser = { ...user };

            // 1. Якщо є файл -> через сервіс
            if (selectedFile) {
                const avatarResponse = await userService.uploadAvatar(selectedFile);
                updatedUser.avatar_url = avatarResponse.avatar_url;
            }

            // 2. Текст -> через сервіс
            const textResponse = await userService.updateProfile(formData);
            
            // 3. Оновлюємо глобальний стан
            const finalUserData = { ...updatedUser, ...textResponse };
            login(localStorage.getItem('token'), finalUserData);
            
            navigate('/profile');

        } catch (error) {
            console.error(error);
            if (error.response?.data?.message?.includes('UNIQUE')) {
                alert("Цей нікнейм вже зайнятий!");
            } else {
                alert("Помилка збереження.");
            }
        }
    };

    // Видалити аватар
    const handleDeleteAvatar = async () => {
        if(!window.confirm("Видалити фото профілю?")) return;
        try {
            await userService.deleteAvatar(); // 👇 ЧЕРЕЗ СЕРВІС
            
            login(localStorage.getItem('token'), { ...user, avatar_url: null });
            setPreview(null);
            setSelectedFile(null);
        } catch (error) {
            alert("Помилка видалення");
        }
    };

    const displaySrc = preview 
        ? preview 
        : (user?.avatar_url ? `http://localhost:3000${user.avatar_url}` : defaultAvatar);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" /> Назад до профілю
            </button>

            <h1 className="text-2xl font-bold text-white font-pixel mb-8">Редагування профілю</h1>

            <div className="space-y-8">
                
                {/* Блок ФОТО */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 shrink-0 relative">
                        <img src={displaySrc} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <div className="flex gap-3">
                            <Button 
                                text="Завантажити нове" 
                                icon={ArrowUpTrayIcon}
                                onClick={() => fileInputRef.current.click()}
                                className="bg-slate-800 text-xs"
                            />
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            
                            {(user?.avatar_url || preview) && (
                                <button 
                                    onClick={handleDeleteAvatar}
                                    className="px-3 py-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition flex items-center justify-center"
                                    title="Видалити фото"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            {preview ? <span className="text-cherry-400">Файл обрано. Натисніть "Зберегти".</span> : "JPG, PNG. Макс 5MB."}
                        </p>
                    </div>
                </div>

                {/* Основне */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cherry-500 uppercase tracking-widest border-b border-slate-800 pb-2">Основне</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Нікнейм" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
                        <Input label="Локація" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 ml-1">Про себе</label>
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:border-cherry-500 outline-none text-sm"
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Контакти */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cherry-500 uppercase tracking-widest border-b border-slate-800 pb-2">Контакти</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
                        <Input label="Telegram" value={formData.social_telegram} onChange={e => setFormData({...formData, social_telegram: e.target.value})} />
                    </div>
                </div>

                {/* Мережі */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cherry-500 uppercase tracking-widest border-b border-slate-800 pb-2">Мережі</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Instagram" value={formData.social_instagram} onChange={e => setFormData({...formData, social_instagram: e.target.value})} />
                        <Input label="ArtStation" value={formData.social_artstation} onChange={e => setFormData({...formData, social_artstation: e.target.value})} />
                        <Input label="Behance" value={formData.social_behance} onChange={e => setFormData({...formData, social_behance: e.target.value})} />
                        <Input label="Twitter / X" value={formData.social_twitter} onChange={e => setFormData({...formData, social_twitter: e.target.value})} />
                        <div className="md:col-span-2">
                            <Input label="Website" value={formData.social_website} onChange={e => setFormData({...formData, social_website: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-800 sticky bottom-0 bg-vampire-950 pb-4 z-20">
                    <button onClick={() => navigate('/profile')} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white">
                        Скасувати
                    </button>
                    <Button text="Зберегти зміни" onClick={handleSave} className="bg-cherry-600 hover:bg-cherry-700" />
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;