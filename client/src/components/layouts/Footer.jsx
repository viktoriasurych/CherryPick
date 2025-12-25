// client/src/components/layouts/Footer.jsx
const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-deep py-6 mt-auto">
            <div className="max-w-[1300px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                
                <div>
                    <h4 className="font-gothic text-md text-blood tracking-widest uppercase">
                        CherryPick
                    </h4>
                </div>

                {/* 👇 Спрощений текст */}
                <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
                    © 2025 | Created by <span className="text-bone">SVV</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;