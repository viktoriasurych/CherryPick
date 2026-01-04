import { useState, useContext, createContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const { data } = await api.get('/users/me');
                    
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data)); 
                    
                } catch (error) {
                    console.error("Помилка перевірки сесії:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token, userData) => {
        console.log("+ Вхід виконано:", userData.nickname);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        console.log("- Вихід");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };
    const updateUser = (newData) => {
        setUser(prev => {
            const updated = { ...prev, ...newData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, isAuth: !!user, login, logout, updateUser, loading }}>
            {loading ? (
                <div className="min-h-screen bg-black flex items-center justify-center text-rose-700 font-bold font-mono tracking-widest uppercase animate-pulse">
                    Summoning User...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};