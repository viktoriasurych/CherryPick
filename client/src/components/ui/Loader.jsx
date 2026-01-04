import React from 'react';
import catWalkGif from '../../assets/cat-walk.gif'; 

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-bone animate-in fade-in duration-500">
            <img 
                src={catWalkGif} 
                alt="Loading..." 
                className="h-20 md:h-32 object-contain mb-6 contrast-110 drop-shadow-xl" 
            />
            
            <p className="font-gothic text-blood text-sm md:text-lg uppercase tracking-[0.3em] animate-pulse text-center px-4">
                {text}
            </p>
        </div>
    );
};

export default Loader;