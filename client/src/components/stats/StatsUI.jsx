import React from 'react';
import { EyeSlashIcon } from '@heroicons/react/24/solid';

export const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest border-l-4 border-cherry-600 pl-3">
        {children}
    </h3>
);

export const KpiCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm h-full">
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
            {Icon && <div className={`p-1.5 rounded-lg bg-slate-900 ${color} bg-opacity-10 shrink-0 border border-slate-800`}><Icon className="w-5 h-5" /></div>}
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-200 font-mono tracking-tight break-all leading-tight">
            {value}
        </div>
    </div>
);

export const ChartContainer = ({ title, children }) => (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col h-[320px] shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest text-center border-b border-slate-900 pb-2 truncate" title={title}>
            {title}
        </h4>
        <div className="flex-grow flex items-center justify-center w-full overflow-hidden">
            {children}
        </div>
    </div>
);

// 👇 НОВЕ: Для профілю (маленькі картки)
export const MiniKpi = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col items-center justify-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition h-full">
        <Icon className={`w-6 h-6 ${color} mb-2`} />
        <div className="text-2xl font-bold text-white font-mono leading-none mb-1">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase font-bold text-center">{label}</div>
    </div>
);

// 👇 НОВЕ: Блок "Приховано"
export const HiddenBlock = ({ label }) => (
    <div className="bg-slate-900/20 border border-dashed border-slate-800 p-6 rounded-xl text-center text-slate-600 flex flex-col items-center justify-center h-full min-h-[100px]">
        <EyeSlashIcon className="w-6 h-6 mb-2 opacity-50"/>
        <p className="text-xs">Статистика "{label}" прихована автором</p>
    </div>
);