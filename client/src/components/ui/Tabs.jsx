const Tabs = ({ items, activeId, onChange, className = "" }) => {
    return (
        <div 
            className={`
                flex items-center gap-8 border-b border-border/50 w-full 
                overflow-x-auto overflow-y-hidden custom-scrollbar pb-1
                ${className}
            `}
        >
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`
                        text-xs font-bold pb-3 transition-colors whitespace-nowrap relative px-1 flex-shrink-0 uppercase tracking-[0.2em] font-mono
                        ${activeId === item.id ? 'text-blood' : 'text-muted hover:text-bone'}
                    `}
                >
                    {item.label}
                    {activeId === item.id && (
                        <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blood shadow-[0_0_10px_#9f1239] animate-in fade-in zoom-in-x duration-300" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;