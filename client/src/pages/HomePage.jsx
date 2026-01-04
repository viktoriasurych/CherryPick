import { Link } from 'react-router-dom';
import { 
    PaintBrushIcon, 
    ChartBarSquareIcon, 
    Square3Stack3DIcon,
    ChevronDownIcon 
} from '@heroicons/react/24/solid';

import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import PageTitle from '../components/shared/PageTitle';
import Button from '../components/ui/Button';

import catSitGif from '../assets/cat-wait.gif'; 

const HomePage = ({ user, logout }) => {
    
    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-void text-bone flex flex-col font-mono">
            <PageTitle title="CherryPick" />

            <Header 
                user={user} 
                logout={logout} 
                isSidebarOpen={false} 
                setIsSidebarOpen={() => {}} 
            />

            <main className="grow flex flex-col items-center justify-center text-center relative overflow-hidden px-4 pt-16 pb-12">
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blood/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                {/* вишня */}
                <div className="mb-8 relative group">
                    <div className="p-6 bg-black/20 rounded-2xl border border-blood/20 shadow-[0_0_30px_rgba(159,18,57,0.2)] backdrop-blur-sm transition-all duration-500 group-hover:border-blood/50 group-hover:shadow-[0_0_50px_rgba(159,18,57,0.4)]">
                        <img 
                            src="/cherry.svg" 
                            alt="CherryPick" 
                            className="w-14 h-14 md:w-16 md:h-16 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold font-gothic mb-6 leading-tight">
                    <span className="text-bone tracking-[0.3em] block mb-3 opacity-90">
                        YOUR SPACE
                    </span>
                    <span className="tracking-[0.15em] font-bold text-transparent bg-clip-text bg-linear-to-r from-blood to-red-500">
                        FOR CREATIVITY
                    </span>
                </h1>

                {/* опис */}
                <p className="text-muted text-xs max-w-lg mb-10 leading-relaxed font-mono tracking-wide px-4 opacity-60">
                    Stop losing ideas in notes. <br className="hidden md:block" />
                    <strong className="text-bone font-bold opacity-100">CherryPick</strong> is a personal art project manager. 
                    Organize, track progress, and analyze your productivity.
                </p>

                {/* кицик + кнопка */}
                {!user && (
                    <div className="flex items-end justify-center gap-6 relative pr-4 mb-8"> 
                        <div className="w-16 h-16 md:w-20 md:h-20 -mb-1 shrink-0"> 
                            <img 
                                src={catSitGif} 
                                alt="Companion" 
                                className="w-full h-full object-contain contrast-125 drop-shadow-xl"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>

                        <div className="mb-2">
                            <Button 
                                to="/auth" 
                                variant="outline" 
                                className="group px-8 py-3"
                            >
                                Start for Free
                                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* скрол */}
                <button 
                    onClick={scrollToFeatures}
                    className="
                        mt-2 md:mt-4
                        flex flex-col items-center gap-1
                        text-muted/30 hover:text-blood/80 
                        transition-all duration-500 
                        cursor-pointer group p-4
                    "
                >
                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-3">
                        Explore
                    </span>
                    <ChevronDownIcon className="w-6 h-6 animate-pulse" />
                </button>

                {/* три квадратика */}
                <div id="features" className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left px-2">
                    <FeatureCard 
                        icon={Square3Stack3DIcon}
                        title="Organization"
                        desc="Keep all your arts, sketches, and ideas in one place. Create collections and moodboards."
                    />
                    <FeatureCard 
                        icon={ChartBarSquareIcon}
                        title="Analytics"
                        desc="Track your productivity. View statistics by genre, time spent, and creative streaks."
                    />
                    <FeatureCard 
                        icon={PaintBrushIcon}
                        title="Progress"
                        desc="Track work stages: from idea to final render. No more forgotten Works-In-Progress."
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="
        p-6 rounded-sm bg-ash/30 
        border border-white/5 hover:border-blood/40 
        transition-all duration-500 group 
        hover:shadow-[0_5px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1
    ">
        <div className="w-10 h-10 bg-void rounded-sm flex items-center justify-center mb-4 border border-white/5 group-hover:border-blood transition-colors duration-500">
            <Icon className="w-5 h-5 text-muted group-hover:text-blood transition-colors duration-300" />
        </div>
        
        <h3 className="
            text-sm font-bold text-bone mb-3 
            font-gothic uppercase tracking-wider 
            group-hover:text-blood 
            transition-colors duration-300
        ">
            {title}
        </h3>
        
        <p className="text-muted text-[11px] leading-relaxed font-mono opacity-60 group-hover:opacity-100 transition-opacity">
            {desc}
        </p>
    </div>
);

export default HomePage;