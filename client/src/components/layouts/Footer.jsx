import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full border-t border-border/40 py-8 mt-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted font-mono uppercase tracking-widest select-none">
                
                <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">   
                    <span className="font-gothic text-blood font-bold text-xs">CherryPick</span>
                </Link>

                <span className="text-border">|</span>
                <span>© 2025–2026</span>
                <span className="text-border">|</span>

                <span>
                    Created by <span className="text-bone font-bold hover:text-blood transition-colors cursor-default">SVV (Syrych Viktoria) </span>
                </span>
                
            </div>
        </footer>
    );
};

export default Footer;