const Section = ({ title, subtitle, children, className = '', id }) => {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
