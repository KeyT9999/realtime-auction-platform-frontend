import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useChat } from '../../contexts/ChatContext';
import Button from '../common/Button';

const MOBILE_BREAKPOINT = 768;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
    closeMobileMenu();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setDropdownOpen(false);
    closeMobileMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinkClass = (active) =>
    `block w-full text-left px-4 py-3 rounded transition-colors ${active ? 'text-primary-blue font-medium bg-gray-50' : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'}`;

  const desktopNav = (
    <nav className="hidden md:flex items-center gap-2 lg:gap-4" aria-label="Main navigation">
      <Link
        to="/auctions"
        className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/auctions') || location.pathname.startsWith('/auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'} hover:bg-gray-50`}
      >
        Đấu giá
      </Link>
      {isAuthenticated && (
        <>
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/admin') || location.pathname.startsWith('/admin') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'} hover:bg-gray-50`}
            >
              Bảng điều khiển
            </Link>
          )}
          <Link
            to="/my-auctions"
            className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/my-auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'} hover:bg-gray-50`}
          >
            Đấu giá của tôi
          </Link>
          <Link
            to="/chat"
            className={`relative text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/chat') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'} hover:bg-gray-50`}
          >
            Chat
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" aria-label={`${unreadCount} tin nhắn chưa đọc`}>
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 px-2 py-1 rounded transition-colors hover:bg-gray-50"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="text-xs sm:text-sm text-text-primary font-medium">
                {user?.fullName || 'Tài khoản'}
              </span>
              {user?.availableBalance !== undefined && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {formatCurrency(user.availableBalance)}
                </span>
              )}
              <svg className={`w-4 h-4 text-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border-primary z-50 py-1" role="menu">
                <button type="button" onClick={handleProfileClick} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors" role="menuitem">Hồ sơ</button>
                <Link to="/wallet" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors" role="menuitem">💰 Ví của tôi</Link>
                <Link to="/my-orders" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors" role="menuitem">📦 Đơn mua</Link>
                <Link to="/my-sales" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors" role="menuitem">💼 Đơn bán</Link>
                <hr className="my-1 border-gray-100" />
                <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors" role="menuitem">Đăng xuất</button>
              </div>
            )}
          </div>
        </>
      )}
      {!isAuthenticated && (
        <>
          <Link to="/login" className="hidden sm:block">
            <Button variant="outline" className="text-sm">Đăng nhập</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" className="text-sm">Đăng ký</Button>
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" aria-label="Về trang chủ">
            <h1 className="text-xl font-bold text-primary-blue">Đấu giá Realtime</h1>
          </Link>

          {desktopNav}

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 top-16 z-20 bg-white overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
        >
          <nav className="py-4 px-4 space-y-1" aria-label="Mobile navigation">
            <Link to="/auctions" className={navLinkClass(isActive('/auctions') || location.pathname.startsWith('/auctions'))} onClick={closeMobileMenu}>
              Đấu giá
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link to="/admin" className={navLinkClass(isActive('/admin') || location.pathname.startsWith('/admin'))} onClick={closeMobileMenu}>
                    Bảng điều khiển
                  </Link>
                )}
                <Link to="/my-auctions" className={navLinkClass(isActive('/my-auctions'))} onClick={closeMobileMenu}>
                  Đấu giá của tôi
                </Link>
                <Link to="/chat" className={navLinkClass(isActive('/chat'))} onClick={closeMobileMenu}>
                  Chat {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <div className="pt-2 pb-1 border-t border-gray-100">
                  <p className="px-4 py-2 text-sm font-medium text-text-primary">{user?.fullName || 'Tài khoản'}</p>
                  {user?.availableBalance !== undefined && (
                    <p className="px-4 py-1 text-sm text-green-700">{formatCurrency(user.availableBalance)}</p>
                  )}
                </div>
                <button type="button" onClick={handleProfileClick} className={navLinkClass(false)}>Hồ sơ</button>
                <Link to="/wallet" className={navLinkClass(false)} onClick={closeMobileMenu}>💰 Ví của tôi</Link>
                <Link to="/my-orders" className={navLinkClass(false)} onClick={closeMobileMenu}>📦 Đơn mua</Link>
                <Link to="/my-sales" className={navLinkClass(false)} onClick={closeMobileMenu}>💼 Đơn bán</Link>
                <button type="button" onClick={handleLogout} className={navLinkClass(false)}>Đăng xuất</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className={navLinkClass(false)} onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full justify-center">Đăng nhập</Button>
                </Link>
                <Link to="/register" className={navLinkClass(false)} onClick={closeMobileMenu}>
                  <Button variant="primary" className="w-full justify-center">Đăng ký</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
