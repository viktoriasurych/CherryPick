import { Link, useNavigate } from 'react-router-dom';
import { 
    TagIcon, SwatchIcon, PaintBrushIcon, 
    IdentificationIcon, CalendarIcon 
} from '@heroicons/react/24/outline';

const ArtworkInfoPanel = ({ artwork, showEditButton = false }) => {
    const navigate = useNavigate();

    if (!artwork) return null;

    const goToFilter = (filterKey, id) => {
        if (!id) return;
        navigate('/projects', { 
            state: { applyFilter: { [filterKey]: [id.toString()] } } 
        });
    };

    const parseList = (idsStr, namesStr) => {
        if (!idsStr || !namesStr) return [];
        const ids = Array.isArray(idsStr) ? idsStr : String(idsStr).split(',');
        const names = Array.isArray(namesStr) ? namesStr : String(namesStr).split(',');
        
        return names.map((name, i) => ({ 
            id: ids[i], 
            name: name.trim() 
        }));
    };

    const renderFuzzyDate = (y, m, d) => {
        if (!y) return '—';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let str = `${y}`;
        if (m) str = `${months[m-1]} ${str}`;
        if (d) str = `${d}, ${str}`;
        return str;
    };

    // 👇 Універсальний "Чіп" (Клікабельний елемент)
    const MetaChip = ({ label, onClick }) => (
        <span 
            onClick={onClick}
            className="
                inline-block 
                bg-void border border-border 
                px-2.5 py-1.5 rounded-sm 
                text-xs text-muted font-bold 
                cursor-pointer 
                transition-all duration-300
                hover:border-blood hover:text-bone hover:shadow-[0_0_10px_rgba(159,18,57,0.2)]
                select-none
                max-w-full truncate
            "
        >
            {label}
        </span>
    );

    return (
        <div className="space-y-6 h-full flex flex-col font-mono">
            
            {/* Опис */}
            <div className="bg-ash/30 p-6 rounded-sm border border-border/50 shadow-inner min-h-[100px]">
                <p className="text-bone whitespace-pre-wrap leading-relaxed text-sm break-words opacity-90">
                    {artwork.description || <span className="italic text-muted/30">Silence... No lore recorded.</span>}
                </p>
            </div>
            
            {/* Дати (Окремий рядок, бо вони не клікабельні фільтри) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-void p-3 rounded-sm border border-border flex items-center justify-between">
                    <span className="text-[9px] text-muted uppercase tracking-widest font-bold opacity-60">Genesis</span>
                    <span className="text-xs font-bold text-bone">{renderFuzzyDate(artwork.started_year, artwork.started_month, artwork.started_day)}</span>
                </div>
                <div className="bg-void p-3 rounded-sm border border-border flex items-center justify-between">
                    <span className="text-[9px] text-muted uppercase tracking-widest font-bold opacity-60">Conclusion</span>
                    {/* 👇 Ніякого зеленого. Якщо є дата - то blood, інакше bone */}
                    <span className={`text-xs font-bold ${artwork.finished_year ? 'text-blood' : 'text-bone'}`}>
                        {renderFuzzyDate(artwork.finished_year, artwork.finished_month, artwork.finished_day)}
                    </span>
                </div>
            </div>

            {/* БЛОКИ АТРИБУТІВ (Тепер всі однакові) */}
            <div className="space-y-4">
                
                {/* 1. GENRE & STYLE (В одному ряду) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Genre */}
                    <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <IdentificationIcon className="w-4 h-4 text-muted" />
                            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Genre</span>
                        </div>
                        <div>
                            {artwork.genre_id ? (
                                <MetaChip label={artwork.genre_name} onClick={() => goToFilter('genre_ids', artwork.genre_id)} />
                            ) : <span className="text-xs text-muted/30 italic">—</span>}
                        </div>
                    </div>

                    {/* Style */}
                    <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <PaintBrushIcon className="w-4 h-4 text-muted" />
                            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Style</span>
                        </div>
                        <div>
                            {artwork.style_id ? (
                                <MetaChip label={artwork.style_name} onClick={() => goToFilter('style_ids', artwork.style_id)} />
                            ) : <span className="text-xs text-muted/30 italic">—</span>}
                        </div>
                    </div>
                </div>

                {/* 2. MATERIALS */}
                <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <SwatchIcon className="w-4 h-4 text-muted" />
                        <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Materials</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {artwork.material_names ? (
                            parseList(artwork.material_ids, artwork.material_names).map((item, i) => (
                                <MetaChip 
                                    key={i} 
                                    label={item.name} 
                                    onClick={() => goToFilter('material_ids', item.id)} 
                                />
                            ))
                        ) : <span className="text-xs text-muted/30 italic">—</span>}
                    </div>
                </div>

                {/* 3. TAGS */}
                <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-muted" />
                        <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {artwork.tag_names ? (
                            parseList(artwork.tag_ids, artwork.tag_names).map((item, i) => (
                                <MetaChip 
                                    key={i} 
                                    label={`#${item.name}`} 
                                    onClick={() => goToFilter('tag_ids', item.id)} 
                                />
                            ))
                        ) : <span className="text-xs text-muted/30 italic">—</span>} 
                    </div>
                </div>
            </div>

            {/* Кнопка редагування */}
            {showEditButton && (
                <div className="pt-4 mt-auto">
                    <Link 
                        to={`/projects/${artwork.id}/edit`} 
                        className="block w-full bg-transparent hover:bg-ash text-muted hover:text-white font-bold py-3 rounded-sm border border-border hover:border-blood transition text-center text-xs uppercase tracking-widest"
                    >
                        Edit Codex
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ArtworkInfoPanel;