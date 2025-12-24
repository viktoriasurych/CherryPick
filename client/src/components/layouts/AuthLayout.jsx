// client/src/components/layouts/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ title, subtitle, children, footer }) => {
    return (
        <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                
                {/* Декоративна смужка */}
                <div className="h-1 bg-gradient-to-r from-cherry-900 via-cherry-500 to-cherry-900"></div>

                <div className="p-8">
                    <h1 className="font-pixel text-2xl md:text-3xl text-center text-cherry-500 mb-2 tracking-wide">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-center text-slate-500 text-sm mb-6 uppercase tracking-widest font-medium">
                            {subtitle}
                        </p>
                    )}

                    {children}

                    {footer && (
                        <div className="mt-8 text-center text-sm border-t border-slate-800 pt-6">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;