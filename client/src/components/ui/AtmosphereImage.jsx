const AtmosphereImage = ({ src, alt, className }) => {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-black ${className}`}>
        <div className="absolute inset-0 z-0">
          <img src={src} className="w-full h-full object-cover blur-2xl opacity-50 scale-110" alt="" />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <img src={src} alt={alt} className="relative z-10 w-full h-full object-contain shadow-2xl drop-shadow-2xl" />
      </div>
    );
  };
  export default AtmosphereImage;