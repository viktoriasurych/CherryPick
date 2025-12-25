import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

// 👇 UI з папки ui
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// 👇 Layouts
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
            const res = await api.post('/auth/forgot-password', { email });
            setStatus({ type: 'success', message: res.data.message });
        } catch (e) {
            setStatus({ 
                type: 'error', 
                message: e.response?.data?.message || "Не вдалося відправити запит." 
            });
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <Link to="/auth" className="text-sm text-slate-500 hover:text-white transition-colors">
            &larr; Повернутися до входу
        </Link>
    );

    return (
        <AuthLayout 
            title="Відновлення доступу 🍒" 
            subtitle="Введіть пошту для скидання паролю"
            footer={footerContent}
        >
            {status.message && (
                <div className={`mb-6 p-3 rounded text-sm text-center border ${
                    status.type === 'success' 
                        ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                        : 'bg-red-900/20 text-red-400 border-red-900/50'
                }`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                    label="Email" 
                    type="email"
                    placeholder="art@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="pt-2">
                    <Button 
                        text={loading ? "Відправка..." : "Надіслати посилання"} 
                        disabled={loading}
                        className="bg-cherry-700 hover:bg-cherry-600 text-white w-full transition-all shadow-lg shadow-cherry-900/20" 
                    />
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;