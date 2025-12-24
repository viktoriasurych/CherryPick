import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layouts/AuthLayout';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { email, token, newPassword: password });
            navigate('/auth'); 
        } catch (e) {
            setError(e.response?.data?.message || "Помилка зміни паролю. Спробуйте ще раз.");
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <p className="mb-4">Невірне посилання для відновлення.</p>
                    <Link to="/auth" className="text-cherry-500 hover:underline">На головну</Link>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout title="Новий пароль 🔐" subtitle="Придумайте надійний пароль">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                    label="Новий пароль" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    error={error}
                />

                {error && !error.includes('пароль') && (
                    <div className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <Button 
                        text={loading ? "Зберігаємо..." : "Змінити пароль"} 
                        disabled={loading}
                        className="bg-cherry-700 hover:bg-cherry-600 text-white w-full transition-all shadow-lg shadow-cherry-900/20" 
                    />
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;