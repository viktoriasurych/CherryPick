import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import artworkService from '../services/artworkService';
import SessionTimer from '../components/SessionTimer';

const SessionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await artworkService.getById(id);
                setArtwork(data);
            } catch (error) {
                navigate('/projects');
            }
        };
        loadData();
    }, [id, navigate]);

    if (!artwork) return <div className="text-center mt-20 text-slate-500">Завантаження студії...</div>;

    return (
        <div className="min-h-screen bg-black text-bone-200 flex flex-col">
            {/* Мікро-хедер, щоб повернутися */}
            <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-4">
                    <Link to={`/projects/${id}`} className="text-slate-500 hover:text-white transition">
                        &larr; Вийти
                    </Link>
                    <h1 className="text-xl font-bold text-slate-300">{artwork.title} <span className="text-cherry-500 text-sm font-normal">/ Сеанс</span></h1>
                </div>
            </div>

            {/* Робоча зона */}
            <div className="grow flex flex-col md:flex-row h-full">
                
                {/* ЛІВА ЧАСТИНА: Референс (Картина) */}
                <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-vampire-950 border-r border-slate-900">
                    {artwork.image_path ? (
                        <img 
                            src={artworkService.getImageUrl(artwork.image_path)} 
                            alt="Reference" 
                            className="max-h-[80vh] object-contain shadow-2xl rounded-lg"
                        />
                    ) : (
                        <div className="text-slate-600">Без референсу</div>
                    )}
                </div>

                {/* ПРАВА ЧАСТИНА: Таймер */}
                <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-slate-950">
                    <div className="w-full max-w-md">
                        <SessionTimer 
                            artworkId={id} 
                            onSessionSaved={() => {
                                // Коли зберегли — повертаємось назад на сторінку деталей
                                navigate(`/projects/${id}`);
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionPage;