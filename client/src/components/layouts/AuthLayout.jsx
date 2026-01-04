import React from 'react';
import catWalk from '../../assets/cat-walk.gif'; 

const AuthLayout = ({ title, subtitle, children, footer }) => {
    return (
        <div className="min-h-screen bg-deep font-mono flex items-center justify-center p-4 relative overflow-hidden">
            
            <div className="w-full max-w-87.5 bg-void/95 border border-border/50 rounded-sm shadow-2xl relative z-10 backdrop-blur-md flex flex-col">
                
                <div className="p-6 pb-2 text-center">
                    <h1 className="font-gothic text-xl text-blood mb-1 tracking-[0.2em] uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="px-6 py-2 grow">
                    {children}
                </div>

                {/* котик */}
                <div className="h-14 border-t border-border/30 relative overflow-hidden w-full mt-4 bg-void/50">
                    <img 
                        src={catWalk} 
                        alt="Walking Cat" 
                        className="cat-anim h-32 max-w-none -bottom-4 opacity-90" 
                    />
                </div>

                {footer && (
                    <div className="py-3 bg-deep/30 border-t border-border/30 text-center">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthLayout;