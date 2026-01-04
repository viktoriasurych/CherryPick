import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageTitle from '../components/shared/PageTitle';
import Button from '../components/ui/Button';
import catWaitGif from '../assets/cat-error.gif'; 

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-void text-bone flex flex-col items-center justify-center text-center p-4 font-mono selection:bg-blood selection:text-white overflow-hidden relative">
            
            <PageTitle title="404 Lost in Void" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blood/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

            <div className="max-w-lg w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
                
                <h1 
                    className="
                        text-[140px] md:text-[200px] font-bold font-gothic leading-none select-none 
                        text-blood
                        opacity-90 drop-shadow-[0_0_30px_rgba(159,18,57,0.6)]
                        relative z-10
                    "
                >
                    404
                </h1>

                {/* киця */}
                <div className="relative -mt-12 mb-8 w-32 h-32 md:w-40 md:h-40 mx-auto pointer-events-none z-20"> 
                    <img 
                        src={catWaitGif} 
                        alt="Lost Cat" 
                        className="w-full h-full object-contain contrast-125 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>

                {/* опис */}
                <h2 className="text-2xl md:text-4xl font-bold text-bone font-gothic uppercase tracking-[0.2em] mb-4 drop-shadow-md">
                    Lost in the <span className="text-blood">Void</span>
                </h2>
                <p className="text-muted text-sm md:text-base font-mono max-w-md mx-auto mb-12 opacity-80 leading-relaxed tracking-wide">
                    The artifact you are looking for does not exist everywhere. <br />
                    Turn back before you are consumed by emptiness.
                </p>

                <Button 
                    to="/" 
                    variant="outline" 
                    className="group gap-3" 
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    Return Home
                </Button>

            </div>
        </div>
    );
};

export default NotFoundPage;