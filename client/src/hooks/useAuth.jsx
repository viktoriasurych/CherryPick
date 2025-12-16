import { useState, useContext, createContext, useEffect } from 'react';
import api from '../api/axios'; // Твій налаштований axios

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. При першому завантаженні сайту перевіряємо, чи є збережений токен
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            // Встановлюємо токен в заголовки за замовчуванням
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(JSON.parse(savedUser));
            setIsAuth(true);
        }
        setLoading(false);
    }, []);

    // 2. Функція Входу (викликаємо її в AuthPage)
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Налаштовуємо Axios на майбутнє
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        setIsAuth(true);
    };

    // 3. Функція Виходу
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Видаляємо токен з Axios
        delete api.defaults.headers.common['Authorization'];
        
        setUser(null);
        setIsAuth(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuth, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};