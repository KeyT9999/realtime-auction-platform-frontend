const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-blue text-white hover:bg-primary-blue-dark focus:ring-primary-blue',
    secondary: 'bg-background-secondary text-text-primary border border-border hover:bg-gray-100 focus:ring-primary-blue',
    outline: 'border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white focus:ring-primary-blue',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
