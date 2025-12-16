const Button = ({ text, onClick, disabled, variant = "primary" }) => {
    const baseStyle = "w-full font-bold py-3 px-6 rounded-md shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-cherry-700 hover:bg-cherry-800 text-white",
      secondary: "bg-transparent border border-cherry-700 text-cherry-500 hover:bg-cherry-900/20",
    };
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyle} ${variants[variant]}`}
      >
        {text}
      </button>
    );
  };
  
  export default Button;