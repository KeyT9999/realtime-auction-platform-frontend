// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Card.
const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`bg-slate-900 rounded-2xl border border-slate-800 shadow-soft shadow-slate-900/50 ${hover ? 'hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300' : ''
        } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
