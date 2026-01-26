const Alert = ({ type = 'info', children, className = '', onClose }) => {
  const types = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4',
  };

  return (
    <div className={`${types[type]} ${className} flex items-start justify-between`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
