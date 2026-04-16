// Mục đích tệp: Trien khai logic/chuc nang chinh cua file FeatureCard.
const FeatureCard = ({ icon, title, description, className = '' }) => {
  return (
    <div className={`group bg-white rounded-2xl border border-slate-200 p-8 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
