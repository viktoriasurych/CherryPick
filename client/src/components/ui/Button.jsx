const Button = ({ text, onClick, disabled, variant = "primary" }) => {
  const baseStyle = "w-full font-bold py-3 px-6 rounded-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed uppercase text-xs tracking-widest font-mono";
  
  const variants = {
    primary: "bg-blood border border-blood text-white hover:bg-blood-hover hover:shadow-[0_0_20px_rgba(159,18,57,0.3)]",
    secondary: "bg-transparent border border-border text-muted hover:border-blood hover:text-blood transition-all duration-300",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]}`}>
      {text}
    </button>
  );
};

export default Button;