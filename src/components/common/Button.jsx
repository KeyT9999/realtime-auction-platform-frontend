// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Button.
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-700 text-white px-6 py-3 shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-glow',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 shadow-soft',
    outline: 'bg-white border border-slate-200 hover:border-primary/50 text-slate-900 hover:text-primary px-6 py-3 shadow-soft',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2',
    danger: 'bg-red-500 hover:bg-red-600 text-white px-6 py-3 shadow-lg shadow-red-500/25',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 shadow-lg shadow-emerald-500/25',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
