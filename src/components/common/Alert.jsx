const Alert = ({ type = 'info', children, className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-primary border-blue-200',
  };

  const icons = {
    error: 'error',
    success: 'check_circle',
    warning: 'warning',
    info: 'info',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} ${className}`}>
      <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">{icons[type]}</span>
      <p className="text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
};

export default Alert;
