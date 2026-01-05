import { Link, useNavigate } from 'react-router-dom';
import { 
    TagIcon, SwatchIcon, PaintBrushIcon, 
    IdentificationIcon
} from '@heroicons/react/24/outline';
import { formatFuzzyDate } from '../../utils/formatters';

const ArtworkInfoPanel = ({ artwork, showEditButton = false }) => {
    const navigate = useNavigate();

    const goToFilter = (filterType, value) => {
        navigate(`/projects?${filterType}=${value}`);
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
                whitespace-normal wrap-break-word leading-tight text-center
            "
        >
            {label}
        </span>
    );

    return (
        <div className="space-y-6 h-full flex flex-col font-mono">
            
            <div className="bg-ash/30 p-6 rounded-sm border border-border/50 shadow-inner min-h-25">
                <p className="text-bone whitespace-pre-wrap leading-relaxed text-sm wrap-break-word opacity-90">
                    {artwork.description || <span className="italic text-muted/30">Silence... No lore recorded.</span>}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-void p-3 rounded-sm border border-border flex flex-col justify-center gap-1">
                    <span className="text-[9px] text-muted uppercase tracking-widest font-bold opacity-60">start</span>
                    <span className="text-xs font-bold text-bone truncate">
                        {formatFuzzyDate(artwork.started_year, artwork.started_month, artwork.started_day) || '—'}
                    </span>
                </div>

                <div className="bg-void p-3 rounded-sm border border-border flex flex-col justify-center gap-1">
                    <span className="text-[9px] text-muted uppercase tracking-widest font-bold opacity-60">Finish</span>
                    <span className={`text-xs font-bold truncate ${artwork.finished_year ? 'text-blood' : 'text-bone'}`}>
                        {formatFuzzyDate(artwork.finished_year, artwork.finished_month, artwork.finished_day) || '—'}
                    </span>
                </div>
            </div>

            {/* атрибути */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* жанр */}
                    <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <IdentificationIcon className="w-4 h-4 text-muted" />
                            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Genre</span>
                        </div>
                        <div className="flex flex-wrap">
                            {artwork.genre_id ? (
                                <MetaChip label={artwork.genre_name} onClick={() => goToFilter('genre_ids', artwork.genre_id)} />
                            ) : <span className="text-xs text-muted/30 italic">—</span>}
                        </div>
                    </div>

                    {/* стиль */}
                    <div className="bg-ash/20 p-4 rounded-sm border border-border flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <PaintBrushIcon className="w-4 h-4 text-muted" />
                            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Style</span>
                        </div>
                        <div className="flex flex-wrap">
                            {artwork.style_id ? (
                                <MetaChip label={artwork.style_name} onClick={() => goToFilter('style_ids', artwork.style_id)} />
                            ) : <span className="text-xs text-muted/30 italic">—</span>}
                        </div>
                    </div>
                </div>

                {/* матеріал */}
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

                {/* теги */}
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

            {showEditButton && (
                <div className="pt-4 mt-auto">
                    <Link 
                        to={`/projects/${artwork.id}/edit`} 
                        className="block w-full bg-transparent hover:bg-ash text-muted hover:text-white font-bold py-3 rounded-sm border border-border hover:border-blood transition text-center text-xs uppercase tracking-widest"
                    >
                        Edit Artwork
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ArtworkInfoPanel;