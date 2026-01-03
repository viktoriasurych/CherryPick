import React from 'react';
import catWalkGif from '../../assets/cat-walk.gif'; 

const Loader = ({ text = "Loading..." }) => {
    return (
        // 👇 ЗМІНА: замість fixed inset-0 (на весь екран), робимо w-full min-h-[50vh]
        // Це означає: ширина на весь блок, висота мінімум пів екрану, по центру
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-bone animate-in fade-in duration-500">
            {/* Котик (адаптивний розмір) */}
            <img 
                src={catWalkGif} 
                alt="Loading..." 
                className="h-20 md:h-32 object-contain mb-6 contrast-110 drop-shadow-xl" 
            />
            
            {/* Текст */}
            <p className="font-gothic text-blood text-sm md:text-lg uppercase tracking-[0.3em] animate-pulse text-center px-4">
                {text}
            </p>
        </div>
    );
};

export default Loader;