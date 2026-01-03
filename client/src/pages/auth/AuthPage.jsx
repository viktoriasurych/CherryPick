import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 👇 ЗАМІСТЬ GoogleLogin беремо хук useGoogleLogin для кастомної кнопки
import { useGoogleLogin } from '@react-oauth/google'; 
import api from '../../api/axios';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/layouts/AuthLayout'; 

import RULES from '../../config/validationRules.json';

// Іконка Google для кастомної кнопки
const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
    </svg>
);

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({ nickname: '', email: '', password: '' });

    // 👇 Логіка кастомного входу через Google
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Відправляємо access_token на бекенд
                const res = await api.post('/auth/google', { 
                    token: tokenResponse.access_token, // бібліотека повертає access_token при використанні хука
                    type: 'access_token' // помітка для бекенду, що це не ID token
                });
                login(res.data.token, res.data.user);
                navigate('/projects');
            } catch (e) {
                console.error("Google Auth Error:", e);
                setError("Google Login Failed.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'nickname') {
            value = value.replace(/\s/g, ''); 
        }
        setFormData({ ...formData, [e.target.name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isLogin) {
            if (formData.nickname.length < RULES.USER.NICKNAME.MIN) {
                setError(`Nickname must be at least ${RULES.USER.NICKNAME.MIN} characters`);
                setLoading(false);
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(formData.nickname)) {
                setError("Nickname can only contain Latin letters, numbers, and '_'");
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
            console.error("Error:", err);
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="text-muted">
                {isLogin ? 'No account?' : 'Have an account?'}
            </span>
            <button 
                onClick={() => { 
                    setIsLogin(!isLogin); 
                    setError(''); 
                    setFormData({ nickname: '', email: '', password: '' });
                }}
                className="text-blood hover:text-white font-bold transition-colors"
            >
                {isLogin ? 'Register' : 'Log In'}
            </button>
        </div>
    );

    return (
        <AuthLayout 
            title="CherryPick" 
            subtitle={isLogin ? 'Archive Access' : 'Join the Coven'}
            footer={footerContent}
        >
            <form onSubmit={handleSubmit} className="space-y-4"> {/* 👇 space-y-4 замість 6 для компактності */}
                {!isLogin && (
                    <Input 
                        label="Nickname" 
                        name="nickname" 
                        placeholder="viky_sia" 
                        value={formData.nickname} 
                        onChange={handleChange} 
                        maxLength={RULES.USER.NICKNAME.MAX}
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
                        label="Password" 
                        name="password" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={handleChange}
                        error={error && error.toLowerCase().includes('password') ? error : null} 
                    />
                    {isLogin && (
                        <div className="flex justify-end">
                            <Link to="/forgot-password" class="text-[9px] text-muted hover:text-blood transition-colors uppercase font-bold tracking-wider">
                                Forgot Password?
                            </Link>
                        </div>
                    )}
                </div>

                {error && !error.toLowerCase().includes('password') && (
                    <div className="text-blood text-[10px] text-center bg-blood/5 p-2 border border-blood/20 font-mono uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <div className="pt-2 space-y-3">
                    <Button 
                        text={loading ? "Processing..." : (isLogin ? "Enter" : "Create Account")} 
                        disabled={loading}
                        className="bg-blood hover:bg-blood-hover text-white w-full shadow-lg shadow-blood/10 rounded-sm font-gothic tracking-[0.2em] uppercase text-xs py-3" 
                    />

                    {/* Розділювач */}
                    <div className="relative flex py-1 items-center opacity-50">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-2 text-muted text-[9px] uppercase font-bold tracking-widest">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    {/* 👇 КАСТОМНА КНОПКА GOOGLE */}
                    <button
                        type="button"
                        onClick={() => googleLogin()}
                        className="
                            w-full flex items-center justify-center 
                            bg-void border border-border hover:border-blood 
                            text-bone hover:text-white 
                            py-2.5 rounded-sm transition-all duration-300
                            text-[10px] font-bold uppercase tracking-widest
                            group
                        "
                    >
                        <GoogleIcon />
                        {isLogin ? "Sign in with Google" : "Sign up with Google"}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default AuthPage;