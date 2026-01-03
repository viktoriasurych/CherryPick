import { useState } from 'react';
import { 
    XMarkIcon, 
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon 
} from '@heroicons/react/24/outline';

const TYPES = [
    {
        id: 'MOODBOARD',
        title: 'Moodboard',
        desc: 'Chaotic grid for inspiration. Perfect for sketches and raw ideas.',
        icon: Squares2X2Icon,
    },
    {
        id: 'SERIES',
        title: 'Series',
        desc: 'Ordered grid with titles. Best for finished series of artworks.',
        icon: QueueListIcon,
    },
    {
        id: 'EXHIBITION',
        title: 'Exhibition',
        desc: 'Premium vertical scroll. Scrollytelling, text blocks, immersion.',
        icon: SparklesIcon,
    }
];

const CollectionCreateModal = ({ isOpen, onClose, onCreate }) => {
    const [step, setStep] = useState(1); 
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', is_public: true });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title) return;
        
        setLoading(true);
        try {
            await onCreate({ ...formData, type: selectedType });
            setStep(1);
            setFormData({ title: '', description: '', is_public: true });
            setSelectedType(null);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // 👇 1. Додано onClick={onClose} на фон (Backdrop)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
            onClick={onClose}
        >
            {/* 👇 2. Додано e.stopPropagation(), щоб клік всередині не закривав модалку */}
            <div 
                className="bg-void border border-border rounded-sm w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh] cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-gothic tracking-wide text-blood">
                        {step === 1 ? 'New Archive' : `New ${TYPES.find(t => t.id === selectedType)?.title}`}
                    </h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* КРОК 1: Вибір типу */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => { setSelectedType(type.id); setStep(2); }}
                                    className={`
                                        group relative p-5 rounded-sm border border-border bg-ash/50 
                                        text-left transition-all duration-300
                                        hover:border-blood hover:bg-void hover:shadow-[0_0_15px_rgba(159,18,57,0.1)]
                                        flex flex-col h-full
                                    `}
                                >
                                    <div className={`w-10 h-10 mb-4 flex items-center justify-center rounded-sm bg-void border border-border group-hover:border-blood/50 transition-colors`}>
                                        <type.icon className="w-5 h-5 text-muted group-hover:text-blood transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-bone mb-2 font-mono uppercase tracking-wider text-sm group-hover:text-blood transition-colors">
                                        {type.title}
                                    </h3>
                                    <p className="text-[10px] text-muted leading-relaxed font-mono opacity-70 group-hover:opacity-100 transition-opacity">
                                        {type.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* КРОК 2: Деталі */}
                    {step === 2 && (
                        <form onSubmit={handleCreate} className="space-y-6">
                            
                            {/* Назва */}
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 font-mono">
                                    Title
                                </label>
                                <input 
                                    className="w-full bg-ash border border-border rounded-sm p-3 text-bone focus:border-blood focus:outline-none transition font-mono placeholder-muted/30"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Ex: Autumn Melancholy..."
                                    autoFocus
                                />
                            </div>
                            
                            {/* Опис */}
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 font-mono">
                                    Description (Optional)
                                </label>
                                <textarea 
                                    className="w-full bg-ash border border-border rounded-sm p-3 text-bone focus:border-blood focus:outline-none transition h-24 resize-none font-mono text-sm placeholder-muted/30"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="What is this collection about?"
                                />
                            </div>

                            {/* Чекбокс Публічності */}
                            <div className="flex items-center gap-3 p-3 bg-ash/50 border border-border rounded-sm">
                                <input 
                                    type="checkbox" 
                                    id="isPublic"
                                    checked={formData.is_public}
                                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                                    className="w-4 h-4 accent-blood bg-void border-border rounded-sm cursor-pointer"
                                />
                                <label htmlFor="isPublic" className="cursor-pointer select-none">
                                    <span className="block text-sm font-bold text-bone font-mono">Public Archive</span>
                                    <span className="block text-[10px] text-muted font-mono">Visible to everyone on your profile</span>
                                </label>
                            </div>

                            {/* Кнопки */}
                            <div className="flex gap-4 pt-4 border-t border-border/50">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-white transition hover:underline"
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !formData.title}
                                    className={`
                                        flex-1 bg-blood hover:bg-blood-hover text-white px-6 py-3 rounded-sm 
                                        text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(159,18,57,0.3)] 
                                        transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {loading ? "Creating..." : "Create Collection"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionCreateModal;