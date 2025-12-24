import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import defaultAvatarImg from '../assets/default-avatar.png';
import artworkService from '../../services/artworkService';

const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Закриваємо при кліку поза елементом
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* КНОПКА (Аватар + Ім'я) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 group focus:outline-none"
            >
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter group-hover:text-cherry-500 transition-colors">Art Profile</p>
                    <p className="text-sm text-bone-100 font-bold">{user.nickname}</p>
                </div>
                <div className={`w-9 h-9 rounded-full border border-slate-700 overflow-hidden shadow-lg transition-all ${isOpen ? 'ring-2 ring-cherry-500 border-transparent' : 'group-hover:border-cherry-500'}`}>
                    <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
                </div>
            </button>

            {/* ВИПАДАЮЧЕ МЕНЮ */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-800 md:hidden">
                        <p className="text-xs text-slate-400 font-bold">{user.nickname}</p>
                        <p className="text-[10px] text-slate-600">{user.email}</p>
                    </div>
                    
                    <div className="p-1">
                        <Link 
                            to="/profile" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                        >
                            <UserIcon className="w-4 h-4" />
                            Мій профіль
                        </Link>
                        
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors mt-1"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Вийти
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;