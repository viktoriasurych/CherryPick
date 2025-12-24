import { useState } from 'react';
import { 
    XMarkIcon, 
    Squares2X2Icon, 
    QueueListIcon, 
    SparklesIcon 
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TYPES = [
    {
        id: 'MOODBOARD',
        title: 'Мудборд',
        desc: 'Хаотична сітка для натхнення. Ідеально для скетчів та ідей.',
        icon: Squares2X2Icon,
        color: 'text-blue-400',
        bg: 'bg-blue-900/20',
        border: 'group-hover:border-blue-500'
    },
    {
        id: 'SERIES',
        title: 'Збірка / Серія',
        desc: 'Впорядкована сітка з назвами. Для завершених серій робіт.',
        icon: QueueListIcon,
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        border: 'group-hover:border-green-500'
    },
    {
        id: 'EXHIBITION',
        title: 'Виставка',
        desc: 'Преміальна вертикальна подача. Scrollytelling, блоки з описом.',
        icon: SparklesIcon,
        color: 'text-purple-400',
        bg: 'bg-purple-900/20',
        border: 'group-hover:border-purple-500'
    }
];

const CollectionCreateModal = ({ isOpen, onClose, onCreate }) => {
    const [step, setStep] = useState(1); // 1 = Type Select, 2 = Details
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title) return;
        
        setLoading(true);
        try {
            await onCreate({ ...formData, type: selectedType });
            // Скидання
            setStep(1);
            setFormData({ title: '', description: '' });
            setSelectedType(null);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-900 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {step === 1 ? 'Створити нову колекцію' : `Нова: ${TYPES.find(t => t.id === selectedType)?.title}`}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* КРОК 1: Вибір типу */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => { setSelectedType(type.id); setStep(2); }}
                                    className={`
                                        group relative p-4 rounded-lg border border-slate-800 bg-slate-900/50 
                                        text-left hover:bg-slate-900 transition-all duration-300
                                        hover:scale-[1.02] hover:shadow-lg ${type.border}
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${type.bg} ${type.color}`}>
                                        <type.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-200 mb-1">{type.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* КРОК 2: Деталі */}
                    {step === 2 && (
                        <form onSubmit={handleCreate} className="space-y-6">
                            <Input 
                                label="Назва колекції" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Наприклад: Осінній сплін..."
                                autoFocus
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Опис (необов'язково)</label>
                                <textarea 
                                    className="w-full bg-black border border-slate-800 rounded-md p-3 text-slate-200 focus:border-cherry-500 focus:outline-none transition h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Про що ця збірка?"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                                >
                                    ← Назад до вибору
                                </button>
                                <Button 
                                    text={loading ? "Створення..." : "Створити Колекцію"} 
                                    className="bg-cherry-600 flex-1"
                                    disabled={loading || !formData.title}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionCreateModal;