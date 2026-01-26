const FeatureCard = ({ icon, title, description, className = '' }) => {
  return (
    <div className={`card hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="flex flex-col items-center text-center">
        {icon && (
          <div className="text-4xl mb-4">{icon}</div>
        )}
        <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
