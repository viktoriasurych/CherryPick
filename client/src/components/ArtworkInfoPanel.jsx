import { Link, useNavigate } from 'react-router-dom';
import { TagIcon, SwatchIcon } from '@heroicons/react/24/outline';

const ArtworkInfoPanel = ({ artwork, showEditButton = false }) => {
    const navigate = useNavigate();

    if (!artwork) return null;

    // 👇 1. Логіка переходу на сторінку проектів з фільтром
    const goToFilter = (filterKey, id) => {
        if (!id) return;
        
        // Переходимо на /projects і передаємо state, який "зловить" useEffect в ProjectsPage
        navigate('/projects', { 
            state: { 
                applyFilter: { [filterKey]: [id.toString()] } 
            } 
        });
    };

    // 👇 2. Хелпер для розбиття рядків ("1,2" та "Олія,Полотно") на об'єкти
    const parseList = (idsStr, namesStr) => {
        if (!idsStr || !namesStr) return [];
        // Якщо раптом прийшов масив, а не рядок - обробляємо і це
        const ids = Array.isArray(idsStr) ? idsStr : String(idsStr).split(',');
        const names = Array.isArray(namesStr) ? namesStr : String(namesStr).split(',');
        
        return names.map((name, i) => ({ 
            id: ids[i], 
            name: name.trim() 
        }));
    };

    // 3. Форматування дати
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
            
            {/* Опис */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-inner">
                <p className="text-bone-100 whitespace-pre-wrap leading-relaxed text-sm md:text-base break-words">
                    {artwork.description || <span className="italic text-slate-500">Опис відсутній...</span>}
                </p>
            </div>
            
            {/* Грід з метаданими */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* ЖАНР (Клікабельний) */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Жанр</span>
                    <span 
                        onClick={() => goToFilter('genre_ids', artwork.genre_id)}
                        className={`font-bold text-sm text-cherry-300 ${artwork.genre_id ? 'cursor-pointer hover:underline hover:text-cherry-400 transition' : ''}`}
                    >
                        {artwork.genre_name || '—'}
                    </span>
                </div>

                {/* СТИЛЬ (Клікабельний) */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Стиль</span>
                    <span 
                        onClick={() => goToFilter('style_ids', artwork.style_id)}
                        className={`font-bold text-sm text-bone-200 ${artwork.style_id ? 'cursor-pointer hover:underline hover:text-white transition' : ''}`}
                    >
                        {artwork.style_name || '—'}
                    </span>
                </div>

                {/* Дати (Статичні) */}
                <InfoBlock label="Початок" value={renderFuzzyDate(artwork.started_year, artwork.started_month, artwork.started_day)} />
                <InfoBlock label="Кінець" value={renderFuzzyDate(artwork.finished_year, artwork.finished_month, artwork.finished_day)} highlight="text-green-400" />
                
                {/* МАТЕРІАЛИ (Список клікабельний) */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <SwatchIcon className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase block">Матеріали</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {artwork.material_names ? (
                            parseList(artwork.material_ids, artwork.material_names).map((item, i) => (
                                <span 
                                    key={i} 
                                    onClick={() => goToFilter('material_ids', item.id)}
                                    className="inline-block bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700 cursor-pointer hover:border-slate-500 hover:text-white transition select-none"
                                >
                                    {item.name}
                                </span>
                            ))
                        ) : <span className="text-sm text-slate-500">—</span>}
                    </div>
                </div>

                {/* ТЕГИ (Список клікабельний) */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <TagIcon className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase block">Теги</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {artwork.tag_names ? (
                            parseList(artwork.tag_ids, artwork.tag_names).map((item, i) => (
                                <span 
                                    key={i} 
                                    onClick={() => goToFilter('tag_ids', item.id)}
                                    className="inline-block bg-cherry-900/20 px-2 py-1 rounded text-xs text-cherry-200 border border-cherry-900/30 cursor-pointer hover:bg-cherry-900/40 hover:border-cherry-500 transition select-none"
                                >
                                    #{item.name}
                                </span>
                            ))
                        ) : <span className="text-sm text-slate-500">—</span>} 
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

// Простий блок для інформації (не клікабельний)
const InfoBlock = ({ label, value, highlight = "text-bone-200" }) => (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase block mb-1">{label}</span>
        <span className={`${highlight} font-bold text-sm`}>{value || '—'}</span>
    </div>
);

export default ArtworkInfoPanel;