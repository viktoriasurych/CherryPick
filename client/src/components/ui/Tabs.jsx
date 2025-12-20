const Tabs = ({ items, activeId, onChange, className = "" }) => {
    return (
        <div 
            className={`
                flex items-center gap-6 border-b border-slate-800/50 w-full 
                overflow-x-auto overflow-y-hidden /* 👈 ЗАБОРОНЯЄМО верт. скрол */
                no-scrollbar /* 👈 НАШ НОВИЙ КЛАС */
                ${className}
            `}
        >
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`
                        text-sm font-bold pb-3 transition whitespace-nowrap relative px-1 flex-shrink-0
                        ${activeId === item.id ? 'text-cherry-500' : 'text-slate-500 hover:text-slate-300'}
                    `}
                >
                    {item.label}
                    {activeId === item.id && (
                        <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-cherry-500 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-in fade-in zoom-in-x duration-300" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;