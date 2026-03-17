import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gavel, User, LogOut, Bell, Settings, ChevronDown,
  Menu, X, Search, Wallet, ShoppingBag, Store, Package, PlusCircle, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useChat } from '../../contexts/ChatContext';
import { notificationService } from '../../services/notificationService';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { toast } from 'sonner';

const navItems = [
  { path: '/auctions', label: 'Khám phá', icon: Gavel },
  { path: '/my-auctions', label: 'Đấu giá của tôi', icon: Package },
  { path: '/create-auction', label: 'Tạo đấu giá', icon: PlusCircle },
  { path: '/chat', label: 'Tin nhắn', icon: MessageSquare },
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const { unreadCount } = useChat();
  const { navigateTo } = usePageTransition();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Notification states
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifications(true);
      const res = await notificationService.getNotifications(1, 15);
      setNotifications(res.notifications || []);
      setNotificationUnread(res.unreadCount ?? 0);
    } catch {
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
    } catch {}
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Người dùng';
  const avatarUrl = user?.avatarUrl;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/auctions" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Gavel className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Bid<span className="text-amber-400">Zone</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              // Only show 'Đấu giá của tôi', 'Tạo đấu giá', 'Tin nhắn' if authenticated
              if (!isAuthenticated && item.path !== '/auctions') return null;
              
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.path === '/chat' && unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ml-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all text-emerald-400 hover:text-white hover:bg-slate-800 whitespace-nowrap"
              >
                <Gavel className="w-4 h-4" />
                Quản trị
              </Link>
            )}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm hover:border-slate-600 transition-colors w-48 xl:w-64">
              <Search className="w-3.5 h-3.5" />
              <span>Tìm kiếm...</span>
              <span className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded">⌘K</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    {notificationUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-900 border-2 border-slate-900">
                        {notificationUnread > 99 ? '99+' : notificationUnread}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-semibold text-white">Thông báo</span>
                          {notificationUnread > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-amber-500 hover:text-amber-400 font-medium"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {loadingNotifications ? (
                            <div className="p-4 text-center text-slate-400 text-sm">Đang tải...</div>
                          ) : notifications.length === 0 ? (
                            <div className="p-6 flex flex-col items-center justify-center text-slate-400">
                              <Bell className="w-8 h-8 mb-2 opacity-20" />
                              <span className="text-sm">Chưa có thông báo</span>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                                  !n.isRead ? 'bg-slate-700/10' : ''
                                }`}
                              >
                                <div className="flex gap-3 items-start">
                                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                                      {n.title}
                                    </div>
                                    {n.message && (
                                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                                        {n.message}
                                      </div>
                                    )}
                                    <div className="text-[10px] text-slate-500 mt-1.5">
                                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-900">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-white hidden sm:block max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-700">
                          <p className="text-sm font-medium text-white truncate">{displayName}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Hồ sơ cá nhân
                          </Link>
                          <Link
                            to="/wallet"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Wallet className="w-4 h-4" />
                            Ví của tôi
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Đơn hàng của tôi
                          </Link>
                          <Link
                            to="/my-sales"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Store className="w-4 h-4" />
                            Đang bán
                          </Link>
                        </div>
                        <div className="p-1 border-t border-slate-700">
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Cài đặt
                          </Link>
                        </div>
                        <div className="p-1 border-t border-slate-700">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => navigateTo('/login', 'Đăng nhập')}
                  className="px-4 py-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigateTo('/register', 'Đăng ký')}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-800 overflow-hidden bg-slate-900"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                if (!isAuthenticated && item.path !== '/auctions') return null;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.path === '/chat' && unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ml-auto">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-emerald-400 hover:text-white hover:bg-slate-800"
                >
                  <Gavel className="w-4 h-4" />
                  Quản trị
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
