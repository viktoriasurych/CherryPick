import { ArrowPathIcon } from '@heroicons/react/24/solid';
import catOracleGif from '../../../assets/cat-meow.gif'; 

const OracleView = ({ quote, onClose }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center relative animate-in fade-in zoom-in duration-500 px-6 py-8 bg-ash/90 backdrop-blur-md border border-border rounded-sm shadow-2xl shadow-black w-full max-w-md">
            
            <h3 className="font-gothic text-blood text-xl uppercase tracking-[0.2em] mb-6 drop-shadow-md">
            Session Complete
            </h3>

            {/* бульбашка */}
            <div className="
                relative 
                bg-black/40             
                border-2 border-blood/50 
                p-5 rounded-lg          
                w-full             
                shadow-lg
                mb-0 z-10
            ">
                <p className="font-gothic text-bone text-sm md:text-base tracking-wide leading-relaxed wrap-break-word">
                    “{quote}”
                </p>

                {/* хвостик бульбашки */}
                <div className="
                    absolute 
                    top-full left-1/2 -translate-x-1/2 
                    border-12 border-transparent   
                    border-t-blood/50                  
                    drop-shadow-sm
                "></div>
            </div>

            <img 
                src={catOracleGif} 
                alt="Oracle" 
                className="h-24 md:h-32 object-contain mb-8 mt-3 contrast-110 drop-shadow-xl relative z-0" 
            />

            <button 
                onClick={onClose}
                className="
                    flex items-center justify-center gap-2
                    w-full max-w-xs 
                    bg-transparent 
                    border-2 border-blood 
                    text-blood 
                    hover:bg-blood hover:text-white 
                    py-3 font-gothic tracking-[0.2em] uppercase text-xs font-bold
                    transition-all shadow-lg rounded-sm
                    group
                "
            >
                <ArrowPathIcon className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                Begin Anew
            </button>
        </div>
    );
};

export default OracleView;