import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Giới thiệu', path: '/about' },
      { label: 'Tính năng', path: '/features' },
      { label: 'Cách hoạt động', path: '/how-it-works' },
      { label: 'Câu hỏi thường gặp', path: '/faq' },
    ],
    support: [
      { label: 'Liên hệ', path: '/contact' },
      { label: 'Điều khoản sử dụng', path: '/terms' },
      { label: 'Chính sách bảo mật', path: '/privacy' },
    ],
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto relative overflow-hidden transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-32 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand & Description (Span 4) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="material-symbols-outlined text-slate-900 font-bold">gavel</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-2xl font-black tracking-tight uppercase">F-Bid</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Nền tảng đấu giá trực tuyến thời gian thực hàng đầu. Trải nghiệm không gian giao dịch minh bạch, an toàn và đẳng cấp.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 hover:border-amber-500/30 transition-all duration-300">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 hover:border-amber-500/30 transition-all duration-300">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 hover:border-amber-500/30 transition-all duration-300">
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
            </div>
          </div>

          {/* Spacer for desktop */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Platform Links (Span 3) */}
          <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-5">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Nền tảng
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 text-sm hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links (Span 3) */}
          <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-5">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Hỗ trợ
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 text-sm hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-slate-500 text-xs font-medium">
            © {currentYear} F-Bid. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Điều khoản dịch vụ</Link>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

