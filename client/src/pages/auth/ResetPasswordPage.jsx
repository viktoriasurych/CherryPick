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
            setError(e.response?.data?.message || "Failed to reset password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-deep flex items-center justify-center font-mono">
                <div className="text-center p-8 border border-border/30 bg-void rounded-sm shadow-2xl">
                    <p className="mb-4 text-blood uppercase tracking-widest text-xs font-bold">Invalid or Expired Link</p>
                    <Link to="/auth" className="text-muted hover:text-bone text-xs underline transition-colors">Return to Safety</Link>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout 
            title="New Secret" 
            subtitle="Forge a new password"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                    label="New Password" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    error={error}
                />

                {error && !error.toLowerCase().includes('password') && (
                    <div className="text-blood text-[10px] text-center bg-blood/5 p-2 border border-blood/20 font-mono uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <Button 
                        text={loading ? "Forging..." : "Reset Password"} 
                        disabled={loading}
                        className="bg-blood hover:bg-blood-hover text-white w-full shadow-lg shadow-blood/10 rounded-sm font-gothic tracking-[0.2em] uppercase text-xs py-3 transition-all" 
                    />
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;