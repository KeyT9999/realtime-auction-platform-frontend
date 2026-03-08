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
    <footer className="bg-white border-t border-slate-200/60 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-white text-xl">gavel</span>
              </div>
              <h2 className="text-slate-900 text-xl font-extrabold tracking-tight">Vela</h2>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Nền tảng đấu giá realtime hàng đầu Việt Nam. Trải nghiệm đấu giá trực tiếp với cập nhật giá tức thì.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-200">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-200">
                <span className="material-symbols-outlined text-xl">alternate_email</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-200">
                <span className="material-symbols-outlined text-xl">brand_awareness</span>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest">
              Nền tảng
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-500 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest">
              Hỗ trợ
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-500 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-xs">
            © {currentYear} Vela Auctions. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
