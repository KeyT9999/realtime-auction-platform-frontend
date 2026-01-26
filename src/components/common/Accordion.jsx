import { useState } from 'react';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-semibold text-text-primary">{title}</span>
        <span className={`text-primary-blue transition-transform duration-200 text-sm ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-4 bg-background-secondary text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
