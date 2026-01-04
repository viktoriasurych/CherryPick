import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layouts/AuthLayout';
import PageTitle from '../../components/shared/PageTitle'; 
import RULES from '../../config/validationRules.json'; 

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    
    const [error, setError] = useState(''); 
    const [successMsg, setSuccessMsg] = useState(''); 
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const emailRegex = new RegExp(RULES.USER.EMAIL.REGEX);
            if (!emailRegex.test(email)) {
                throw new Error("Invalid email format");
            }

            await api.post('/auth/forgot-password', { email });
            
            setSuccessMsg("SCROLL DISPATCHED (IF EMAIL EXISTS)");
            
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Connection failed";
            setError(msg === "Invalid email format" ? msg : "User not found or connection failed");
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
            <PageTitle title="Recovery" />

            {successMsg && (
                <div className="mb-6 p-4 rounded-sm text-[10px] text-center border font-mono uppercase tracking-widest shadow-lg transition-all duration-300 bg-blood/20 text-bone border-blood shadow-blood/10">
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <Input 
                    label="Email Address" 
                    type="email"
                    placeholder="art@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                    }}
                    required
                    error={error}
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