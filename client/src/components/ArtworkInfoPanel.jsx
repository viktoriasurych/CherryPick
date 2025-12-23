import { Link } from 'react-router-dom';
import { TagIcon } from '@heroicons/react/24/outline';

const ArtworkInfoPanel = ({ artwork, showEditButton = false }) => {
    if (!artwork) return null;

    const renderFuzzyDate = (y, m, d) => {
        if (!y) return '—';
        const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
        let str = `${y}`;
        if (m) str = `${months[m-1]} ${str}`;
        if (d) str = `${d}, ${str}`;
        return str;
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            
            {/* Опис (Цитату прибрали) */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-inner">
                <p className="text-bone-100 whitespace-pre-wrap leading-relaxed text-sm md:text-base break-words">
                    {artwork.description || <span className="italic text-slate-500">Опис відсутній...</span>}
                </p>
            </div>
            
            {/* Грід з метаданими */}
            <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Жанр" value={artwork.genre_name} highlight="text-cherry-300" />
                <InfoBlock label="Стиль" value={artwork.style_name} />
                <InfoBlock label="Початок" value={renderFuzzyDate(artwork.started_year, artwork.started_month, artwork.started_day)} />
                <InfoBlock label="Кінець" value={renderFuzzyDate(artwork.finished_year, artwork.finished_month, artwork.finished_day)} highlight="text-green-400" />
                
                {/* Матеріали */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase block mb-2">Матеріали</span>
                    <div className="flex flex-wrap gap-1">
                        {artwork.material_names ? artwork.material_names.split(',').map((m, i) => (
                            <span key={i} className="inline-block bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">{m.trim()}</span>
                        )) : <span className="text-sm text-slate-500">—</span>}
                    </div>
                </div>

                {/* Теги (Виправлено на "-") */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <TagIcon className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase block">Теги</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {artwork.tag_names ? artwork.tag_names.split(',').map((t, i) => (
                            <span key={i} className="inline-block bg-cherry-900/20 px-2 py-1 rounded text-xs text-cherry-200 border border-cherry-900/30">
                                #{t.trim()}
                            </span>
                        )) : <span className="text-sm text-slate-500">—</span>} 
                    </div>
                </div>
            </div>

            {/* Кнопка редагування */}
            {showEditButton && (
                <div className="pt-4 mt-auto">
                    <Link to={`/projects/${artwork.id}/edit`} className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 hover:border-cherry-500 transition text-center text-sm">
                        ✎ Редагувати
                    </Link>
                </div>
            )}
        </div>
    );
};

const InfoBlock = ({ label, value, highlight = "text-bone-200" }) => (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase block mb-1">{label}</span>
        <span className={`${highlight} font-bold text-sm`}>{value || '—'}</span>
    </div>
);

export default ArtworkInfoPanel;