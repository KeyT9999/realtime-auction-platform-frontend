import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import Button from '../common/Button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-primary-blue">
              Đấu giá Realtime
            </h1>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Public Navigation Links */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/about"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/about') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Giới thiệu
                </Link>
                <Link
                  to="/marketplace"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/marketplace') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/features"
                  className={`hidden lg:block text-sm px-2 py-1 rounded transition-colors ${isActive('/features') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Tính năng
                </Link>
                <Link
                  to="/how-it-works"
                  className={`hidden lg:block text-sm px-2 py-1 rounded transition-colors ${isActive('/how-it-works') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Cách hoạt động
                </Link>
                <Link
                  to="/faq"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/faq') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Câu hỏi thường gặp
                </Link>
                <Link
                  to="/contact"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/contact') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Liên hệ
                </Link>
              </>
            )}

            {/* Public auction link */}
            <Link
              to="/auctions"
              className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${
                isActive('/auctions') || location.pathname.startsWith('/auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
              } hover:bg-gray-50`}
            >
              Đấu giá
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${
                      isActive('/dashboard') || location.pathname.startsWith('/admin') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                <Link
                  to="/dashboard"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/dashboard') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/marketplace"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/marketplace') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/sell"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/sell') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Sell Item
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/admin') || location.pathname.startsWith('/admin') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                      } hover:bg-gray-50`}
                  >
                    Bảng điều khiển
                  </Link>
                )}
                <Link
                  to="/my-auctions"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${
                    isActive('/my-auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                  } hover:bg-gray-50`}
                  to="/profile"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/profile') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Đấu giá của tôi
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 sm:gap-3 px-2 py-1 rounded transition-colors hover:bg-gray-50"
                  >
                    <span className="text-xs sm:text-sm text-text-primary font-medium">
                      {user?.fullName || 'KeyT Tạp Hóa'}
                    </span>
                    {user?.role && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        className={`px-2 py-1 text-xs rounded-full hidden sm:inline ${user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}
                      >
                        {user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 text-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border-primary z-50">
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          Hồ sơ
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
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
        </div>
      </div>
    </header>
  );
};

export default Header;
