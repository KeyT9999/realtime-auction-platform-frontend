// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Input.
const Input = ({ label, error, className = '', icon, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
            <span className="material-symbols-outlined text-slate-400 text-lg">{icon}</span>
          </span>
        )}
        <input
          className={`w-full bg-slate-900/50 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:ring-amber-500/20 focus:border-amber-500/50'
            } rounded-xl py-3 ${icon ? 'pl-10' : 'pl-4'} pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:bg-slate-800 transition-all duration-200 outline-none ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
