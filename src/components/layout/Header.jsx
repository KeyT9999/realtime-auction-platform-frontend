import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useChat } from '../../contexts/ChatContext';
import Button from '../common/Button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
            {/* Link Đấu giá - giống nhau cho mọi trạng thái */}
            <Link
              to="/auctions"
              className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/auctions') || location.pathname.startsWith('/auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                } hover:bg-gray-50`}
            >
              Đấu giá
            </Link>

            {/* Khi đã đăng nhập: thêm Đấu giá của tôi + Bảng điều khiển (admin) + dropdown user */}
            {isAuthenticated ? (
              <>
                {/* Admin dashboard link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/admin') || location.pathname.startsWith('/admin')
                      ? 'text-primary-blue font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                      } hover:bg-gray-50`}
                  >
                    Bảng điều khiển
                  </Link>
                )}

                <Link
                  to="/my-auctions"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/my-auctions') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Đấu giá của tôi
                </Link>

                {/* Messages Link */}
                <Link
                  to="/chat"
                  className={`relative text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/chat') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Chat
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 sm:gap-3 px-2 py-1 rounded transition-colors hover:bg-gray-50"
                  >
                    <span className="text-xs sm:text-sm text-text-primary font-medium">
                      {user?.fullName || 'KeyT Tạp Hóa'}
                    </span>

                    {/* Balance display - chỉ hiển thị khi có user và balance */}
                    {user?.availableBalance !== undefined && (
                      <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {formatCurrency(user.availableBalance)}
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
                        <Link
                          to="/wallet"
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          💰 Ví của tôi
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          📦 Đơn mua
                        </Link>
                        <Link
                          to="/my-sales"
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          💼 Đơn bán
                        </Link>
                        <hr className="my-1 border-gray-100" />
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
