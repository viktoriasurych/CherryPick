import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';

import EditorLayout from '../../components/layouts/EditorLayout';
import Input from '../../components/ui/Input';
import ConfirmModal from '../../components/shared/ConfirmModal';
import PageTitle from '../../components/shared/PageTitle'; 
import Loader from '../../components/ui/Loader'; 

import { PhotoIcon, CloudArrowUpIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import defaultAvatar from '../../assets/default-avatar.png';
import RULES from '../../config/validationRules.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfileEditPage = () => {
    const { user, login } = useAuth(); 
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nickname: '', 
        display_name: '', 
        bio: '', location: '', contact_email: '',
        social_telegram: '', social_instagram: '', social_artstation: '',
        social_behance: '', social_twitter: '', social_website: '',
        show_global_stats: true,
        show_kpi_stats: true,
        show_heatmap_stats: true
    });

    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    useEffect(() => {
        const loadFreshData = async () => {
            try {
                const freshUser = await userService.getProfile();
                
                setFormData({
                    nickname: freshUser.nickname || '',
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
                    
                    show_global_stats: Boolean(freshUser.show_global_stats),
                    show_kpi_stats: Boolean(freshUser.show_kpi_stats),
                    show_heatmap_stats: Boolean(freshUser.show_heatmap_stats)
                });
            } catch (error) {
                console.error("Profile load error:", error);
                if (user) setFormData(prev => ({...prev, nickname: user.nickname})); 
            } finally {
                setIsLoading(false);
            }
        };
        loadFreshData();
    }, []); 

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleChange = (field, value) => {
        if (field === 'nickname') value = value.replace(/\s/g, '');
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleCheckboxChange = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
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
            setIsSaving(true);

            if (formData.nickname.length < (RULES.USER?.NICKNAME?.MIN || 3)) {
                throw new Error(`Nickname must be at least ${RULES.USER?.NICKNAME?.MIN || 3} characters`);
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
            setErrorModal({ 
                isOpen: true, 
                message: error.response?.data?.message || error.message 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getAvatarUrl = () => {
        if (previewUrl) return previewUrl;
        if (isAvatarDeleted) return defaultAvatar; 
        if (!user?.avatar_url) return defaultAvatar;

        if (user.avatar_url.startsWith('http')) return user.avatar_url;

        const cleanPath = user.avatar_url.startsWith('/') ? user.avatar_url : `/${user.avatar_url}`;
        return `${API_URL}${cleanPath}`;
    };

    const displayAvatar = getAvatarUrl();

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            <PageTitle title="Edit profile" />

            <EditorLayout
                title="Edit Artwork"
                backLink="/profile"
                isSaving={isSaving}
                hasChanges={hasChanges}
                onSave={handleSave}
            >
                {/* фото + приват публіч  */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* аватарка */}
                    <div className="bg-ash border border-border p-6 rounded-sm flex flex-col items-center text-center shadow-lg">
                        <h3 className="text-xs font-bold text-bone/60 font-gothic tracking-widest uppercase mb-6 w-full text-left border-b border-border/50 pb-2">
                            Visual ID
                        </h3>
                        
                        <div className="w-48 h-48 rounded-sm overflow-hidden border border-border shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-6 relative group bg-black">
                            <img src={displayAvatar} alt="Avatar Preview" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-50"/>
                            
                            <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <PhotoIcon className="w-10 h-10 text-bone" />
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button onClick={() => fileInputRef.current.click()} className="w-full bg-void hover:bg-black text-bone py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition border border-border hover:border-blood">
                                <CloudArrowUpIcon className="w-4 h-4"/> Upload Photo
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*"/>

                            {((user?.avatar_url && !isAvatarDeleted) || previewUrl) && (
                                <button onClick={handleDeleteAvatar} className="w-full text-blood hover:text-red-400 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition opacity-70 hover:opacity-100">
                                    <TrashIcon className="w-4 h-4"/> {previewUrl ? "Cancel Upload" : "Remove Photo"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* прив + публ */}
                    <div className="bg-ash border border-border p-6 rounded-sm shadow-lg">
                        <h3 className="text-xs font-bold text-bone/60 font-gothic tracking-widest uppercase mb-4 border-b border-border/50 pb-2">
                            Privacy Settings
                        </h3>
                        <div className="space-y-3">
                            <PrivacyToggle label="Global Stats" checked={formData.show_global_stats} onChange={() => handleCheckboxChange('show_global_stats')} />
                            <PrivacyToggle label="Activity KPI" checked={formData.show_kpi_stats} onChange={() => handleCheckboxChange('show_kpi_stats')} />
                            <PrivacyToggle label="Heatmap" checked={formData.show_heatmap_stats} onChange={() => handleCheckboxChange('show_heatmap_stats')} />
                        </div>
                    </div>
                </div>

                {/* про мене */}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-ash border border-border p-6 rounded-sm shadow-lg space-y-6">
                        <h3 className="text-xs font-bold text-bone/60 font-gothic tracking-widest uppercase mb-2 border-b border-border/50 pb-2">
                            Identity
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Display Name" value={formData.display_name} onChange={e => handleChange('display_name', e.target.value)} maxLength={50} placeholder="Ex: Victoria Art 🎨"/>
                            <Input label="Nickname (Unique ID)" value={formData.nickname} onChange={e => handleChange('nickname', e.target.value)} maxLength={30} placeholder="viky_sia" hint="Latin letters, numbers, '_'. No spaces."/>
                        </div>

                        <Input label="Location" value={formData.location} onChange={e => handleChange('location', e.target.value)} maxLength={50} placeholder="Kyiv, Ukraine"/>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-[10px] text-muted uppercase font-bold tracking-widest">Bio / Artwork</label>
                                <span className="text-[10px] text-muted font-mono">{formData.bio.length} / {RULES.USER?.BIO?.MAX || 500}</span>
                            </div>
                            <textarea 
                                className="w-full bg-void border border-border rounded-sm p-3 text-bone text-sm focus:border-blood outline-none transition h-32 resize-none font-mono placeholder-muted/30"
                                value={formData.bio} 
                                onChange={e => handleChange('bio', e.target.value)} 
                                maxLength={RULES.USER?.BIO?.MAX || 500}
                                placeholder="Tell the world about your art..."
                            />
                        </div>
                    </div>

                    <div className="bg-ash border border-border p-6 rounded-sm shadow-lg space-y-8">
                        
                        <div>
                            <h3 className="text-xs font-bold text-bone/60 font-gothic tracking-widest uppercase mb-4 border-b border-border/50 pb-2">
                                Contact Channel
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Email" value={formData.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="public@email.com" />
                                <Input label="Telegram" value={formData.social_telegram} onChange={e => handleChange('social_telegram', e.target.value)} placeholder="@username" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-bone/60 font-gothic tracking-widest uppercase mb-4 border-b border-border/50 pb-2">
                                Network Grid
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Instagram" value={formData.social_instagram} onChange={e => handleChange('social_instagram', e.target.value)} placeholder="@username" />
                                <Input label="ArtStation" value={formData.social_artstation} onChange={e => handleChange('social_artstation', e.target.value)} placeholder="username" />
                                <Input label="Behance" value={formData.social_behance} onChange={e => handleChange('social_behance', e.target.value)} placeholder="username" />
                                <Input label="Twitter / X" value={formData.social_twitter} onChange={e => handleChange('social_twitter', e.target.value)} placeholder="@username" />
                                <div className="md:col-span-2">
                                    <Input label="Personal Website" value={formData.social_website} onChange={e => handleChange('social_website', e.target.value)} placeholder="https://mysite.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </EditorLayout>

            <ConfirmModal 
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
                title="System Error"
                message={errorModal.message}
                confirmText="Close"
            />
        </>
    );
};

const PrivacyToggle = ({ label, checked, onChange }) => (
    <div 
        onClick={onChange}
        className={`
            flex items-center justify-between p-3 rounded-sm border cursor-pointer transition-all group
            ${checked ? 'bg-void border-border' : 'bg-void/50 border-border/50 opacity-60'}
        `}
    >
        <span className="text-[10px] font-bold uppercase tracking-wider text-bone group-hover:text-blood transition-colors">
            {label}
        </span>
        <div className={`transition-colors ${checked ? 'text-blood' : 'text-muted'}`}>
            {checked ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
        </div>
    </div>
);

export default ProfileEditPage;