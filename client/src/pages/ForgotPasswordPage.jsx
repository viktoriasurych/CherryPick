import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error'
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

    return (
        <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative">
                
                {/* Декоративна смужка */}
                <div className="h-1 bg-gradient-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

                <div className="p-8">
                    <h1 className="font-pixel text-2xl text-center text-cherry-500 mb-2 tracking-wide">
                        Відновлення доступу 🍒
                    </h1>
                    <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest font-medium">
                        Введіть пошту для скидання паролю
                    </p>

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

                    <div className="mt-8 text-center border-t border-slate-800 pt-6">
                        <Link to="/auth" className="text-sm text-slate-500 hover:text-white transition-colors">
                            &larr; Повернутися до входу
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;