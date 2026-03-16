import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-amber-500/50 bg-slate-900/80 shadow-lg shadow-amber-500/5' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between transition-colors duration-200"
      >
        <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-amber-500' : 'text-white'}`}>{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-amber-500/20 text-amber-500 rotate-180' : 'bg-slate-800 text-slate-400'}`}>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
