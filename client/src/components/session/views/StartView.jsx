import { PlayIcon } from '@heroicons/react/24/solid';

const StartView = ({ onStart }) => {
    return (
        <div className="flex justify-center items-center h-full">
            <button 
                onClick={onStart} 
                className="
                    group relative flex items-center justify-center 
                    w-40 h-40 
                    bg-black/40 border-2 border-blood/60 
                    shadow-[0_0_30px_rgba(159,18,57,0.1)] 
                    hover:shadow-[0_0_50px_rgba(159,18,57,0.6)] 
                    hover:border-blood hover:bg-blood/10 hover:scale-105
                    transition-all duration-500 ease-out
                    cursor-pointer
                "
                // 👇 style={{ transform: 'rotate(45deg)' }} // Можна розвернути ромбом, якщо хочеш
            >
                {/* Внутрішній квадрат для декору */}
                <div className="absolute inset-2 border border-white/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col items-center gap-2 relative z-10">
                    <PlayIcon className="w-16 h-16 text-blood group-hover:text-red-500 transition-colors drop-shadow-lg" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted group-hover:text-bone font-bold transition-colors">
                        Begin
                    </span>
                </div>
            </button>
        </div>
    );
};

export default StartView;