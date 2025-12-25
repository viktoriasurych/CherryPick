import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import defaultAvatarImg from '../../assets/default-avatar.png';
import artworkService from '../../services/artworkService';

// 👇 1. Імпортуємо модалку
import ConfirmModal from '../shared/ConfirmModal';

const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // 👇 2. Стан для модалки виходу
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    const dropdownRef = useRef(null);

    // Закриваємо меню при кліку поза елементом
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const avatarSrc = user?.avatar_url 
        ? artworkService.getImageUrl(user.avatar_url) 
        : defaultAvatarImg;

    // 👇 3. Функція, яка відкриває модалку (а не виходить зразу)
    const handleLogoutClick = () => {
        setIsOpen(false); // Закриваємо дропдаун
        setShowLogoutConfirm(true); // Відкриваємо модалку
    };

    // 👇 4. Функція підтвердження
    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        onLogout(); // Викликаємо справжній логаут, переданий з Layout
    };

    return (
        <>
            <div className="relative font-mono" ref={dropdownRef}>
                {/* КНОПКА (Аватар + Ім'я) */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 group focus:outline-none"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-[9px] text-muted font-bold uppercase tracking-widest group-hover:text-blood transition-colors">
                            Art Profile
                        </p>
                        <p className="text-sm text-bone font-bold group-hover:text-white transition-colors">
                            {user.nickname}
                        </p>
                    </div>
                    
                    <div className={`
                        w-10 h-10 rounded-full border-2 overflow-hidden transition-all duration-300
                        ${isOpen ? 'border-blood shadow-[0_0_10px_#9f1239]' : 'border-border group-hover:border-muted'}
                    `}>
                        <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
                    </div>
                </button>

                {/* ВИПАДАЮЧЕ МЕНЮ */}
                {isOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-ash border border-border rounded-md shadow-2xl shadow-black overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="p-4 border-b border-border md:hidden bg-void/50">
                            <p className="text-sm text-bone font-bold">{user.nickname}</p>
                            <p className="text-[10px] text-muted">{user.email}</p>
                        </div>
                        
                        <div className="p-2 flex flex-col gap-1">
                            <Link 
                                to="/profile" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-xs text-bone hover:bg-charcoal hover:text-white rounded-sm transition-colors uppercase tracking-wider"
                            >
                                <UserIcon className="w-4 h-4 text-muted" />
                                My Crypt
                            </Link>
                            
                            <div className="h-px bg-border my-1 mx-2" />

                            <button 
                                onClick={handleLogoutClick} // 👈 Тут тепер відкриття модалки
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-xs text-blood hover:bg-blood/10 hover:text-blood-hover rounded-sm transition-colors uppercase tracking-wider font-bold"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                Exit Void
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 👇 5. Сама модалка */}
            <ConfirmModal 
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Leaving so soon?"
                message="Are you sure you want to log out? Your session will be terminated."
                confirmText="Log Out"
            />
        </>
    );
};

export default UserDropdown;