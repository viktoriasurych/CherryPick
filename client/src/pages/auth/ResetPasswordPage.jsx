import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layouts/AuthLayout';
import PageTitle from '../../components/shared/PageTitle';
import RULES from '../../config/validationRules.json';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [error, setError] = useState(''); 
    const [generalError, setGeneralError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setGeneralError('');

        try {
            const passRegex = new RegExp(RULES.USER.PASSWORD.REGEX);
            if (!passRegex.test(password)) {
                throw new Error(RULES.USER.PASSWORD.ERROR_MSG || "Password is too weak");
            }

            await api.post('/auth/reset-password', { email, token, newPassword: password });
            
            navigate('/auth'); 

        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to reset password.";
            
            if (msg.toLowerCase().includes('password') || msg.includes('weak') || msg.includes('8 chars')) {
                setError(msg);
            } else {
                setGeneralError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-void text-bone flex flex-col items-center justify-center font-mono selection:bg-blood selection:text-white p-4">
                 <PageTitle title="Error" />
                <div className="max-w-md w-full text-center p-8 border border-blood/30 bg-ash/10 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-gothic text-blood mb-4 tracking-widest uppercase">Link Invalid</h2>
                    <p className="mb-8 text-muted text-xs leading-relaxed">
                        This session scroll has crumbled to dust.<br/>
                        The link is either expired or incomplete.
                    </p>
                    <Link 
                        to="/auth" 
                        className="
                            inline-block border border-muted/50 text-muted px-6 py-2 text-[10px] uppercase tracking-[0.2em] 
                            hover:border-blood hover:text-blood transition-all duration-300
                        "
                    >
                        Return to Safety
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout 
            title="New Secret" 
            subtitle="Forge a new password"
        >
            <PageTitle title="Reset Password" />

            {generalError && (
                <div className="mb-6 p-3 bg-void border border-blood text-blood text-[10px] text-center font-mono uppercase tracking-wider shadow-lg">
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <Input 
                    label="New Password" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                        if (generalError) setGeneralError('');
                    }}
                    required
                    error={error} 
                />

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