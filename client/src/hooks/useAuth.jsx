import { useState, useContext, createContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Початковий стан: ми не знаємо, чи є юзер, тому loading = true
    const [loading, setLoading] = useState(true);

    // 1. ПЕРЕВІРКА ПРИ ЗАПУСКУ (Один раз при старті)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                console.log("🔄 Відновлення сесії...");
                // Встановлюємо токен для Axios
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // Відновлюємо юзера зі сховища
                setUser(JSON.parse(savedUser));
            }
            // Завантаження завершено (успішно чи ні)
            setLoading(false);
        };

        checkAuth();
    }, []);

    // 2. ВХІД (Login & Auto-login after Register)
    const login = (token, userData) => {
        console.log("✅ Вхід виконано:", userData.nickname);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
    };

    // 3. ВИХІД
    const logout = () => {
        console.log("👋 Вихід");
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        delete api.defaults.headers.common['Authorization'];
        
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuth: !!user, login, logout, loading }}>
            {/* Поки перевіряємо токен, показуємо заглушку, щоб не кидало на логін */}
            {loading ? (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cherry-500 font-bold">
                    Завантаження...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};