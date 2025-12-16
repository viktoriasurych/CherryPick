// client/src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Щоб переходити на інші сторінки
import api from '../api/axios'; // Наш міст
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // true = Вхід, false = Реєстрація
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Стан форми
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: ''
    });

    // Коли вводиш текст
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Прибираємо помилку, коли юзер починає виправляти
    };

    // Коли тиснеш кнопку
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            
            // 1. Відправляємо запит
            const response = await api.post(endpoint, formData);

            console.log("Успіх:", response.data);

            // 2. Якщо прийшов токен (при вході)
            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // Зберігаємо в браузері
                localStorage.setItem('user', JSON.stringify(response.data.user)); // Зберігаємо інфо про юзера
                navigate('/gallery'); // Перекидаємо в галерею
            } else {
                // Якщо це була реєстрація, перемикаємо на вхід
                setIsLogin(true);
                alert("Реєстрація успішна! Тепер увійдіть.");
            }

        } catch (err) {
            // Якщо сервер повернув помилку (напр. "Слабкий пароль")
            setError(err.response?.data?.message || 'Щось пішло не так. Перевірте email/пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // 1. Зовнішній контейнер: Темний готичний фон (Vampire-950)
        <div className="min-h-screen bg-vampire-950 font-sans flex items-center justify-center p-4">
            
            {/* 2. Картка форми: Контрастна картка */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative">
            
            {/* Декор зверху: Градієнт з Cherry-кольорів */}
            <div className="h-1 bg-linear-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

            <div className="p-8">
                {/* Заголовок: Cherry-акцент */}
                <h1 className="font-pixel text-3xl text-center text-cherry-500 mb-2">CherryPick 🍒</h1>
                <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest">
                    {isLogin ? 'Вхід до архіву' : 'Новий художник'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-2">
                    
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
                        error={error} // Передаємо помилку сюди
                    />

                    <div className="pt-4">
                        {/* Кнопка: Cherry-фон */}
                        <Button 
                            text={loading ? "Завантаження..." : (isLogin ? "Увійти" : "Створити акаунт")} 
                            disabled={loading}
                            className="bg-cherry-700 hover:bg-cherry-900 text-white" // Стилі кнопки з твоїм @theme
                        />
                    </div>
                </form>

                {/* Перемикач */}
                <div className="mt-6 text-center text-sm border-t border-slate-800 pt-4">
                    <span className="text-slate-500 mr-2">
                        {isLogin ? 'Ще немає акаунту?' : 'Вже зареєстровані?'}
                    </span>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        // Посилання: Cherry-акцент
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