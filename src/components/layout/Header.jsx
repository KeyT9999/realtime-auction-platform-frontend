import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useChat } from '../../contexts/ChatContext';
import { notificationService } from '../../services/notificationService';
import Button from '../common/Button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (dropdownOpen || notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, notificationOpen]);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifications(true);
      const res = await notificationService.getNotifications(1, 15);
      setNotifications(res.notifications || []);
      setNotificationUnread(res.unreadCount ?? 0);
    } catch (_) {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (notificationOpen) loadNotifications();
  }, [notificationOpen, isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotificationUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

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

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded transition-colors hover:bg-gray-50 text-text-secondary hover:text-text-primary"
                    aria-label="Thông báo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notificationUnread > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center">
                        {notificationUnread > 99 ? '99+' : notificationUnread}
                      </span>
                    )}
                  </button>
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="p-2 border-b flex justify-between items-center">
                        <span className="font-semibold text-text-primary">Thông báo</span>
                        {notificationUnread > 0 && (
                          <button type="button" onClick={handleMarkAllRead} className="text-xs text-primary-blue hover:underline">Đánh dấu đã đọc</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="p-4 text-center text-text-secondary text-sm">Đang tải...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-text-secondary text-sm">Chưa có thông báo</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-3 py-2 border-b border-gray-50 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                            >
                              <div className="font-medium text-sm text-text-primary">{n.title}</div>
                              {n.message && <div className="text-xs text-text-secondary mt-0.5">{n.message}</div>}
                              <div className="text-xs text-gray-400 mt-1">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                              </div>
                              {n.relatedId && (
                                <Link to={`/auctions/${n.relatedId}`} onClick={() => setNotificationOpen(false)} className="text-xs text-primary-blue hover:underline mt-1 inline-block">
                                  Xem chi tiết
                                </Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
