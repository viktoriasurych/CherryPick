import React from 'react';

const Thumbnail = ({ src, alt, size = "md", rounded = "rounded-lg", className = "" }) => {
  // Розміри
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
    full: "w-full aspect-square" // Квадрат на всю ширину
  };

  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} ${rounded} overflow-hidden bg-slate-900 border border-slate-800 shrink-0 ${className}`}>
      {src ? (
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
            {/* Тут можна іконку-заглушку */}
            ?
        </div>
      )}
    </div>
  );
};

export default Thumbnail;