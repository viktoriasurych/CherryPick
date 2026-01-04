import { Link } from 'react-router-dom';

const Button = ({ children, text, onClick, disabled, variant = "primary", to, className = "" }) => {
  const baseStyle = "inline-flex items-center justify-center font-bold py-3 px-6 rounded-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed uppercase text-xs tracking-widest font-mono select-none";
  
  const variants = {
    primary: "bg-blood border border-blood text-white hover:bg-blood-hover hover:shadow-[0_0_20px_rgba(159,18,57,0.3)]",
    secondary: "bg-transparent border border-border text-muted hover:border-blood hover:text-blood transition-all duration-300",
    outline: "bg-transparent border border-blood text-blood hover:bg-blood hover:text-white shadow-[0_0_10px_rgba(159,18,57,0.1)] hover:shadow-[0_0_20px_rgba(159,18,57,0.4)]",
  };

  const finalClass = `${baseStyle} ${variants[variant] || variants.primary} ${className}`;
  const content = children || text;

  if (to) {
    return (
      <Link to={to} className={finalClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={finalClass}>
      {content}
    </button>
  );
};

export default Button;