import React from 'react';
import { EyeSlashIcon } from '@heroicons/react/24/outline';

export const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-bold text-bone font-gothic tracking-widest uppercase border-l-2 border-blood pl-3 mb-4">
        {children}
    </h3>
);

export const KpiCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-ash border border-border/50 p-5 rounded-sm flex flex-col justify-between hover:border-blood/50 transition-all duration-300 shadow-md group h-full">
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] md:text-xs text-muted font-bold uppercase tracking-[0.2em]">{label}</span>
            {Icon && (
                <div className={`p-2 rounded-sm bg-void border border-border group-hover:border-blood/30 transition-colors shadow-inner ${color || 'text-blood'}`}>
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
                </div>
            )}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-bone font-mono tracking-tight break-all leading-none mt-auto">
            {value}
        </div>
    </div>
);

export const ChartContainer = ({ title, children }) => (
    <div className="bg-ash border border-border/50 p-4 rounded-sm flex flex-col h-80 shadow-md hover:shadow-lg transition-shadow relative group">
        <h4 className="text-[10px] font-bold text-muted mb-2 uppercase tracking-[0.2em] text-center border-b border-border pb-2 truncate group-hover:text-bone transition-colors" title={title}>
            {title}
        </h4>
        <div className="grow flex items-center justify-center w-full overflow-hidden">
            {children}
        </div>
    </div>
);

export const MiniKpi = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col items-center justify-center bg-void/50 p-4 rounded-sm border border-border hover:border-blood/50 transition-colors h-full group">
        <Icon className={`w-6 h-6 mb-2 transition-transform group-hover:scale-110 ${color || 'text-blood'}`} />
        <div className="text-xl font-bold text-bone font-mono leading-none mb-1.5">{value}</div>
        <div className="text-[9px] text-muted uppercase font-bold tracking-wider text-center">{label}</div>
    </div>
);

export const HiddenBlock = ({ label }) => (
    <div className="bg-void/30 border border-dashed border-border/40 p-6 rounded-sm text-center text-muted flex flex-col items-center justify-center h-full min-h-30">
        <EyeSlashIcon className="w-6 h-6 mb-2 opacity-40"/>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            {label} Hidden
        </p>
    </div>
);