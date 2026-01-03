import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layouts/AuthLayout';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' }); 
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/auth/forgot-password', { email });
            // 👇 ТУТ БУЛО: res.data.message
            // 👇 СТАЛО: Пишемо свій текст англійською, ігноруючи сервер
            setStatus({ type: 'success', message: "SCROLL DISPATCHED (IF EMAIL EXISTS)" });
        } catch (e) {
            setStatus({ 
                type: 'error', 
                message: "User not found or connection failed." 
            });
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <div className="flex justify-center">
            <Link to="/auth" className="text-[10px] uppercase tracking-widest font-bold text-muted hover:text-bone transition-colors">
                &larr; Return to Login
            </Link>
        </div>
    );

    return (
        <AuthLayout 
            title="Recovery" 
            subtitle="Summon Reset Link"
            footer={footerContent}
        >
            {status.message && (
                <div className={`
                    mb-6 p-4 rounded-sm text-[10px] text-center border font-mono uppercase tracking-widest shadow-lg
                    ${status.type === 'success' 
                        // 👇 УСПІХ: Темно-червоний фон, світлий текст (замість зеленого)
                        ? 'bg-blood/20 text-bone border-blood shadow-blood/10' 
                        // 👇 ПОМИЛКА: Майже чорний фон, яскраво-червоний текст
                        : 'bg-void text-blood border-blood/50'}
                `}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                    label="Email Address" 
                    type="email"
                    placeholder="art@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="pt-2">
                    <Button 
                        text={loading ? "Summoning..." : "Send Link"} 
                        disabled={loading}
                        className="bg-blood hover:bg-blood-hover text-white w-full shadow-lg shadow-blood/10 rounded-sm font-gothic tracking-[0.2em] uppercase text-xs py-3 transition-all" 
                    />
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;