import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; 
import api from '../../api/axios';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/layouts/AuthLayout'; 
import PageTitle from '../../components/shared/PageTitle';

import RULES from '../../config/validationRules.json';

const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
    </svg>
);

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true); 
    const [loading, setLoading] = useState(false);
    
    const [errors, setErrors] = useState({}); 

    const [formData, setFormData] = useState({ nickname: '', email: '', password: '' });

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const res = await api.post('/auth/google', { 
                    token: tokenResponse.access_token, 
                    type: 'access_token' 
                });
                login(res.data.token, res.data.user);
                navigate('/projects');
            } catch (e) {
                console.error("Google Auth Error:", e);
                setErrors({ general: "Google Login Failed." });
            } finally {
                setLoading(false);
            }
        },
        onError: () => setErrors({ general: 'Google Login Failed' }),
    });

    const handleChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;

        if (name === 'nickname') {
            value = value.replace(/\s/g, ''); 
        }
        
        setFormData({ ...formData, [name]: value });
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
        if (errors.general) {
            setErrors({ ...errors, general: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!isLogin) {
            if (formData.nickname.length < RULES.USER.NICKNAME.MIN) {
                newErrors.nickname = `Min ${RULES.USER.NICKNAME.MIN} characters`;
                isValid = false;
            } else if (!new RegExp(RULES.USER.NICKNAME.REGEX).test(formData.nickname)) {
                newErrors.nickname = "Invalid characters"; // Коротше повідомлення для UI
                isValid = false;
            }
        }

        if (!new RegExp(RULES.USER.EMAIL.REGEX).test(formData.email)) {
            newErrors.email = "Invalid email address";
            isValid = false;
        }

        if (!isLogin) {
            if (!new RegExp(RULES.USER.PASSWORD.REGEX).test(formData.password)) {
                newErrors.password = "Must contain 8+ chars, numbers & letters";
                isValid = false;
            }
        } else {
            if (!formData.password) {
                newErrors.password = "Password is required";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, formData);

            if (response.data.token) {
                login(response.data.token, response.data.user);
                navigate('/projects');
            }

        } catch (err) {
            console.error("Auth Error:", err);
            const msg = err.response?.data?.message || err.message || 'Something went wrong.';
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setFormData({ nickname: '', email: '', password: '' });
    };

    const footerContent = (
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="text-muted">
                {isLogin ? 'No account?' : 'Have an account?'}
            </span>
            <button 
                onClick={toggleMode}
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
            <PageTitle title={isLogin ? 'Login' : 'Register'} />

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {!isLogin && (
                    <Input 
                        label="Nickname" 
                        name="nickname" 
                        placeholder="painter" 
                        value={formData.nickname} 
                        onChange={handleChange} 
                        maxLength={RULES.USER.NICKNAME.MAX}
                        error={errors.nickname}
                    />
                )}

                <Input 
                    label="Email" 
                    name="email" 
                    type="email"
                    placeholder="art@example.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    error={errors.email}
                />

                <div className="space-y-1">
                    <Input 
                        label="Password" 
                        name="password" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={handleChange}
                        error={errors.password}
                    />
                    
                    {isLogin && !errors.password && (
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-[9px] text-muted hover:text-blood transition-colors uppercase font-bold tracking-wider">
                                Forgot Password?
                            </Link>
                        </div>
                    )}
                </div>

                {errors.general && (
                    <div className="text-blood text-[10px] text-center bg-blood/5 p-3 border border-blood/20 font-mono uppercase tracking-wider">
                        {errors.general}
                    </div>
                )}

                <div className="pt-2 space-y-3">
                    <Button 
                        text={loading ? "Processing..." : (isLogin ? "Enter" : "Create Account")} 
                        disabled={loading}
                        className="w-full shadow-lg shadow-blood/10 rounded-sm font-gothic tracking-[0.2em] uppercase text-xs py-3" 
                    />

                    <div className="relative flex py-1 items-center opacity-50">
                        <div className="grow border-t border-border"></div>
                        <span className="shrink-0 mx-2 text-muted text-[9px] uppercase font-bold tracking-widest">OR</span>
                        <div className="grow border-t border-border"></div>
                    </div>

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