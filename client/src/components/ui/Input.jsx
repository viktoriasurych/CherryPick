const Input = ({ label, type = "text", name, placeholder, value, onChange, error }) => {
    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
          {label}
        </label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-slate-900 border rounded p-3 text-sm text-slate-200
            transition-colors duration-200 focus:outline-none focus:ring-1
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-slate-700 focus:border-cherry-500 focus:ring-cherry-500"}
          `}
        />
        {/* Якщо є помилка - показуємо її червоним знизу */}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };
  
  export default Input;