import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { formatDigitalTime } from '../../../utils/formatters';

const TimerView = ({ status, seconds, onTogglePause, onStop }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-10 px-8 bg-ash/90 backdrop-blur-md border border-border rounded-sm shadow-2xl shadow-black w-full max-w-md">
            
            {/* статус */}
            <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-white/5 bg-black/20">
                <div className={`w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-blood animate-pulse' : 'bg-red-900/50'}`}></div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                    {status === 'RUNNING' ? 'Focus Mode' : 'Paused'}
                </span>
            </div>

            {/* час */}
            <div className={`
                font-mono font-bold tracking-tighter tabular-nums transition-colors
                text-5xl sm:text-6xl md:text-7xl drop-shadow-lg
                ${status === 'RUNNING' ? 'text-bone' : 'text-muted'}
            `}>
                {formatDigitalTime(seconds)}
            </div>

            {/* кнопки */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={onStop}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:border-red-500 hover:bg-red-900/20 text-muted hover:text-red-500 transition-all shadow-lg"
                    title="Finish Session"
                >
                    <div className="w-3 h-3 bg-current rounded-sm"></div>
                </button>

                <button 
                    onClick={onTogglePause}
                    className="w-20 h-20 flex items-center justify-center rounded-full border border-blood/30 hover:border-blood shadow-lg hover:shadow-blood/20 transition-all group bg-black/20"
                >
                    {status === 'RUNNING' 
                        ? <PauseIcon className="w-8 h-8 text-bone group-hover:text-blood transition-colors" /> 
                        : <PlayIcon className="w-8 h-8 text-blood ml-1" />
                    }
                </button>
            </div>
        </div>
    );
};

export default TimerView;