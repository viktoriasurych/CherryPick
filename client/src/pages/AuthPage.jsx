import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth'; // 👈 Імпорт хука авторизації

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // 👈 Дістаємо функцію входу з контексту
    
    const [isLogin, setIsLogin] = useState(true); // true = Вхід, false = Реєстрація
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Очищаємо помилку, коли юзер починає писати
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            
            // Відправляємо запит на сервер
            const response = await api.post(endpoint, formData);

            console.log("Відповідь сервера:", response.data);

            if (response.data.token) {
                login(response.data.token, response.data.user);
                navigate('/projects');
            }

        } catch (err) {
            console.error("Помилка:", err);
            // Виводимо повідомлення від бекенду або загальне
            setError(err.response?.data?.message || 'Щось пішло не так. Перевірте з’єднання.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative">
                
                {/* Декоративна смужка зверху */}
                <div className="h-1 bg-gradient-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

                <div className="p-8">
                    {/* Заголовок */}
                    <h1 className="font-pixel text-3xl text-center text-cherry-500 mb-2 tracking-wide">
                        CherryPick 🍒
                    </h1>
                    <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest font-medium">
                        {isLogin ? 'Вхід до архіву' : 'Новий художник'}
                    </p>

                    {/* Форма */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Поле Нікнейм (тільки для реєстрації) */}
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
                            error={error} // Показуємо помилку під полем пароля (або можна окремим блоком)
                        />

                        {/* Блок помилки, якщо вона не прив'язана до конкретного поля */}
                        {error && !error.includes('Пароль') && (
                            <div className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button 
                                text={loading ? "Обробка..." : (isLogin ? "Увійти" : "Створити акаунт")} 
                                disabled={loading}
                                className="bg-cherry-700 hover:bg-cherry-600 text-white w-full transition-all shadow-lg shadow-cherry-900/20" 
                            />
                        </div>
                    </form>

                    {/* Перемикач Вхід / Реєстрація */}
                    <div className="mt-8 text-center text-sm border-t border-slate-800 pt-6">
                        <span className="text-slate-500 mr-2">
                            {isLogin ? 'Ще немає акаунту?' : 'Вже є акаунт?'}
                        </span>
                        <button 
                            onClick={() => { 
                                setIsLogin(!isLogin); 
                                setError(''); 
                                setFormData({ nickname: '', email: '', password: '' }); // Очистка форми при перемиканні
                            }}
                            className="text-cherry-500 hover:text-cherry-400 font-bold hover:underline transition-colors"
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