const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Так, видалити" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-slate-950 border border-red-900/50 p-6 rounded-lg max-w-sm w-full shadow-2xl relative transform scale-100 transition-transform">
                
                <h3 className="text-xl font-bold text-red-500 mb-2">{title}</h3>
                <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm font-bold"
                    >
                        Скасувати
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-900/20 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;