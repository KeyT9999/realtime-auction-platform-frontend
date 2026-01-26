import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`input-field transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
