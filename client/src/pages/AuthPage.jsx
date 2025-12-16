// client/src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth'; // <--- 1. ДОДАЛИ ІМПОРТ

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // <--- 2. ДІСТАЛИ ФУНКЦІЮ LOGIN
    
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, formData);

            console.log("Успіх:", response.data);

            // Якщо прийшов токен (Вхід успішний)
            if (response.data.token) {
                
                // <--- 3. ВИДАЛИЛИ localStorage.setItem...
                // <--- 3. ЗАМІНИЛИ НА ЦЕ:
                login(response.data.token, response.data.user); 

                navigate('/gallery');
            } else {
                // Якщо це була реєстрація
                setIsLogin(true);
                alert("Реєстрація успішна! Тепер увійдіть.");
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Щось пішло не так. Перевірте email/пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-vampire-950 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative">
                {/* Виправив bg-linear-to-r на bg-gradient-to-r (це стандарт Tailwind) */}
                <div className="h-1 bg-linear-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

                <div className="p-8">
                    <h1 className="font-pixel text-3xl text-center text-cherry-500 mb-2">CherryPick 🍒</h1>
                    <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest">
                        {isLogin ? 'Вхід до архіву' : 'Новий художник'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4"> {/* Трохи збільшив відступ space-y-4 */}
                        
                        {!isLogin && (
                            <Input 
                                label="Нікнейм" 
                                name="nickname" 
                                placeholder="VikySia" 
                                value={formData.nickname} 
                                onChange={handleChange} 
                            />
                        )}

                        <Input 
                            label="Email" 
                            name="email" 
                            type="email"
                            placeholder="art@example.com" 
                            value={formData.email} 
                            onChange={handleChange} 
                        />

                        <Input 
                            label="Пароль" 
                            name="password" 
                            type="password"
                            placeholder="••••••••" 
                            value={formData.password} 
                            onChange={handleChange}
                            error={error}
                        />

                        <div className="pt-4">
                            <Button 
                                text={loading ? "Завантаження..." : (isLogin ? "Увійти" : "Створити акаунт")} 
                                disabled={loading}
                                className="bg-cherry-700 hover:bg-cherry-900 text-white w-full" 
                            />
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm border-t border-slate-800 pt-4">
                        <span className="text-slate-500 mr-2">
                            {isLogin ? 'Ще немає акаунту?' : 'Вже зареєстровані?'}
                        </span>
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-cherry-500 hover:text-cherry-700 font-bold hover:underline transition-colors"
                        >
                            {isLogin ? 'Реєстрація' : 'Увійти'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;