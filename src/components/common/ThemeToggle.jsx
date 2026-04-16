// Mục đích tệp: Trien khai logic/chuc nang chinh cua file ThemeToggle.
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

/**
 * A compact icon button that toggles between dark and light mode.
 * Adapts its visual style automatically based on current theme.
 */
export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
            className={`
        relative w-9 h-9 rounded-lg flex items-center justify-center
        transition-all duration-200 overflow-hidden
        ${isDark
                    ? 'bg-slate-800 border border-slate-700 text-amber-400 hover:border-amber-500/50 hover:text-amber-300'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-500'
                }
        ${className}
      `}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="moon"
                        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-4 h-4" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-4 h-4" />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
