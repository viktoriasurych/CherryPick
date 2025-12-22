import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; 
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
// 👇 1. Імпортуємо правила для валідації (щоб знати ліміти)
import RULES from '../config/validationRules.json'; 

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        // Забираємо пробіли з нікнейму на льоту (бо нікнейм для URL)
        let value = e.target.value;
        if (e.target.name === 'nickname') {
            value = value.replace(/\s/g, ''); // Видаляємо пробіли
        }
        setFormData({ ...formData, [e.target.name]: value });
        setError('');
    };

    // --- ЛОГІКА 1: Звичайний вхід ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // 👇 Валідація на клієнті перед відправкою
        if (!isLogin) {
            if (formData.nickname.length < RULES.USER.NICKNAME.MIN) {
                setError(`Нікнейм має бути мінімум ${RULES.USER.NICKNAME.MIN} символи`);
                setLoading(false);
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(formData.nickname)) {
                setError("Нікнейм може містити тільки латинські літери, цифри та '_'");
                setLoading(false);
                return;
            }
        }

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, formData);

            if (response.data.token) {
                login(response.data.token, response.data.user);
                navigate('/projects');
            }
        } catch (err) {
            console.error("Помилка:", err);
            setError(err.response?.data?.message || 'Щось пішло не так. Перевірте з’єднання.');
        } finally {
            setLoading(false);
        }
    };

    // --- ЛОГІКА 2: Вхід через Google ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await api.post('/auth/google', { 
                token: credentialResponse.credential 
            });
            
            login(res.data.token, res.data.user);
            navigate('/projects');
        } catch (e) {
            console.error("Google Auth Error:", e);
            setError("Не вдалося увійти через Google. Спробуйте ще раз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                
                <div className="h-1 bg-gradient-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

                <div className="p-8">
                    <h1 className="font-pixel text-3xl text-center text-cherry-500 mb-2 tracking-wide">
                        CherryPick 🍒
                    </h1>
                    <p className="text-center text-slate-500 text-sm mb-6 uppercase tracking-widest font-medium">
                        {isLogin ? 'Вхід до архіву' : 'Новий художник'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Поле Нікнейм (тільки реєстрація) */}
                        {!isLogin && (
                            <Input 
                                label="Нікнейм (для посилання)" 
                                name="nickname" 
                                placeholder="viky_sia" 
                                value={formData.nickname} 
                                onChange={handleChange} 
                                maxLength={RULES.USER.NICKNAME.MAX}
                                // Додаткова підказка під полем
                                hint="Тільки латиниця, цифри та '_'"
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

                        <div className="space-y-1">
                            <Input 
                                label="Пароль" 
                                name="password" 
                                type="password"
                                placeholder="••••••••" 
                                value={formData.password} 
                                onChange={handleChange}
                                error={error && error.toLowerCase().includes('пароль') ? error : null} 
                            />
                            {isLogin && (
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" class="text-[10px] text-slate-500 hover:text-cherry-400 transition-colors uppercase font-bold tracking-wider">
                                        Забули пароль?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Загальна помилка */}
                        {error && !error.toLowerCase().includes('пароль') && (
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

                    <div className="mt-6 mb-4">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest">або</span>
                            <div className="flex-grow border-t border-slate-800"></div>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="350px" 
                            locale="uk"
                            text={isLogin ? "signin_with" : "signup_with"}
                        />
                    </div>

                    <div className="mt-8 text-center text-sm border-t border-slate-800 pt-6">
                        <span className="text-slate-500 mr-2">
                            {isLogin ? 'Ще немає акаунту?' : 'Вже є акаунт?'}
                        </span>
                        <button 
                            onClick={() => { 
                                setIsLogin(!isLogin); 
                                setError(''); 
                                setFormData({ nickname: '', email: '', password: '' });
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