// Input.jsx
const Input = ({ label, type = "text", name, placeholder, value, onChange, error }) => {
  return (
    <div className="mb-4 font-mono text-left">
      <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-[0.2em]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full bg-void border p-3 text-sm text-bone rounded-sm
          transition-all duration-300 focus:outline-none
          ${error 
            ? "border-blood focus:shadow-[0_0_10px_rgba(159,18,57,0.2)]" 
            : "border-border focus:border-blood focus:shadow-[0_0_5px_rgba(159,18,57,0.1)]"}
        `}
      />
      {error && <p className="text-blood text-[10px] mt-1.5 uppercase tracking-tighter animate-pulse">{error}</p>}
    </div>
  );
};
export default Input;