import { Link } from 'react-router-dom';
import { 
    PaintBrushIcon, 
    ChartBarSquareIcon, 
    Square3Stack3DIcon, 
    ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/solid';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-cherry-500 selection:text-white">
            
            {/* === HEADER (Шапка) === */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Логотип */}
                    <div className="flex items-center gap-2">
                        <PaintBrushIcon className="w-6 h-6 text-cherry-500" />
                        <span className="text-xl font-bold font-pixel text-white tracking-wide">
                            Cherry<span className="text-cherry-500">Pick</span>
                        </span>
                    </div>

                    {/* Навігація (Кнопка входу) */}
                    <nav>
                        <Link 
                            to="/auth" 
                            className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Увійти
                        </Link>
                    </nav>
                </div>
            </header>

            {/* === HERO SECTION (Головний екран) === */}
            <main className="flex-grow pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                
                {/* Фоновий декоративний елемент */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cherry-900/20 rounded-full blur-[100px] -z-10"></div>

                <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-700">
                    <PaintBrushIcon className="w-20 h-20 text-cherry-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white font-pixel mb-6 tracking-wide leading-tight">
                    Твій простір <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cherry-400 to-purple-500">
                        для творчості
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    Досить губити ідеї в нотатках. 
                    <strong className="text-slate-200"> CherryPick</strong> — це персональний менеджер арт-проєктів. 
                    Організовуй, слідкуй за прогресом та аналізуй свою продуктивність.
                </p>

                <Link 
                    to="/auth" 
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-cherry-600 font-pixel rounded-xl shadow-lg hover:shadow-cherry-500/25 hover:bg-cherry-700 hover:-translate-y-1"
                >
                    Розпочати безкоштовно
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                {/* === FEATURES (Переваги) === */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
                    <FeatureCard 
                        icon={Square3Stack3DIcon}
                        title="Організація"
                        desc="Зберігай усі свої арти, скетчі та ідеї в одному місці. Створюй колекції та мудборди."
                    />
                    <FeatureCard 
                        icon={ChartBarSquareIcon}
                        title="Аналітика"
                        desc="Слідкуй за своєю продуктивністю. Дивись статистику по жанрах, часу та стріках."
                    />
                    <FeatureCard 
                        icon={PaintBrushIcon}
                        title="Прогрес"
                        desc="Відслідковуй етапи роботи: від ідеї до фінального рендеру. Більше жодних забутих WIP-ів."
                    />
                </div>
            </main>

            {/* === FOOTER (Підвал) === */}
            <footer className="border-t border-slate-900 bg-slate-950 py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                    
                    {/* Колонка 1: Лого */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="font-pixel text-lg text-white">Cherry<span className="text-cherry-500">Pick</span></div>
                        <p className="text-slate-500 max-w-xs">
                            Створено художниками для художників. <br />
                            Твій цифровий арт-асистент.
                        </p>
                    </div>

                    {/* Колонка 2: Навігація */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Продукт</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cherry-400 transition">Можливості</a></li>
                            <li><a href="#" className="hover:text-cherry-400 transition">Оновлення</a></li>
                            <li><a href="#" className="hover:text-cherry-400 transition">Roadmap</a></li>
                        </ul>
                    </div>

                    {/* Колонка 3: Контакти */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Контакти</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cherry-400 transition">GitHub</a></li>
                            <li><a href="#" className="hover:text-cherry-400 transition">Twitter</a></li>
                            <li><a href="#" className="hover:text-cherry-400 transition">Instagram</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
                    © {new Date().getFullYear()} CherryPick Art Manager. Всі права захищено.
                </div>
            </footer>
        </div>
    );
};

// Міні-компонент для карток переваг
const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cherry-500/30 transition-colors group">
        <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-slate-800">
            <Icon className="w-6 h-6 text-cherry-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-pixel">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default HomePage;