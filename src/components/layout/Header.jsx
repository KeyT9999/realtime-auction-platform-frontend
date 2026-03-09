import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { useChat } from '../../contexts/ChatContext';
import { notificationService } from '../../services/notificationService';
import { usePageTransition } from '../../contexts/PageTransitionContext';

/* ─────────────────────────────────────────────
   ICON helpers (inline SVG, no extra deps)
───────────────────────────────────────────── */
const Icon = ({ d, size = 20, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  hammer:   'M15 5L19 9M5.68 19.32a2.4 2.4 0 003.39 0l9.26-9.26a2.4 2.4 0 000-3.39L16.34 4.68a2.4 2.4 0 00-3.39 0L3.68 13.93a2.4 2.4 0 000 3.39l2 2z',
  bell:     'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chat:     ['M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'],
  user:     ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  wallet:   ['M21 12V7H5a2 2 0 010-4h14v4', 'M3 5v14a2 2 0 002 2h16v-5', 'M18 12a2 2 0 100 4 2 2 0 000-4z'],
  orders:   ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2','M9 7h6M9 11h6M9 15h4'],
  logout:   ['M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4','M10 17l5-5-5-5','M15 12H3'],
  chevron:  'M6 9l6 6 6-6',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  grid:     ['M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],
  users:    ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75','M9 11a4 4 0 100-8 4 4 0 000 8z'],
  tag:      'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
  check:    'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
};

/* ─────────────────────────────────────────────
   Shared styles injected once
───────────────────────────────────────────── */
const HEADER_STYLES = `
  /* USER header */
  .hdr-user {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(37,99,235,0.1);
    box-shadow: 0 2px 20px rgba(15,23,42,0.06), 0 1px 0 rgba(37,99,235,0.06);
    transition: background 0.3s;
  }
  /* ADMIN header */
  .hdr-admin {
    position: sticky; top: 0; z-index: 100;
    background: rgba(15,23,42,0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(59,130,246,0.20);
    box-shadow: 0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(59,130,246,0.10);
  }
  .hdr-logo-user {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.25rem;
    color: #0F172A;
    letter-spacing: -0.02em;
  }
  .hdr-logo-user span { background: linear-gradient(135deg,#2563EB 0%,#3B82F6 50%,#1D4ED8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hdr-logo-admin {
    font-family: 'Playfair Display', serif;
    font-weight: 700; font-size: 1.15rem; letter-spacing: -0.02em; color: #F8FAFC;
  }
  .hdr-logo-admin span { background: linear-gradient(135deg,#60A5FA 0%,#93C5FD 50%,#3B82F6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  /* Nav links - user */
  .hdr-nav-link {
    position: relative; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.01em;
    padding: 0.375rem 0.75rem; border-radius: 0.5rem; transition: all 0.2s;
    color: #475569;
  }
  .hdr-nav-link:hover { color: #0F172A; background: rgba(37,99,235,0.05); }
  .hdr-nav-link.active { color: #2563EB; }
  .hdr-nav-link.active::after {
    content:''; position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
    width:60%; height:2px; border-radius:1px;
    background: linear-gradient(90deg,#2563EB,#3B82F6);
  }

  /* Nav links - admin */
  .hdr-nav-link-admin {
    position: relative; font-size: 0.8125rem; font-weight: 500; letter-spacing: 0.04em;
    text-transform: uppercase; padding: 0.375rem 0.75rem; border-radius: 0.5rem; transition: all 0.2s;
    color: rgba(248,250,252,0.5);
  }
  .hdr-nav-link-admin:hover { color: rgba(248,250,252,0.9); background: rgba(255,255,255,0.06); }
  .hdr-nav-link-admin.active { color: #93C5FD; }
  .hdr-nav-link-admin.active::after {
    content:''; position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
    width:70%; height:2px; border-radius:1px;
    background: linear-gradient(90deg,#3B82F6,#60A5FA);
  }

  /* Icon button */
  .hdr-icon-btn {
    position:relative; display:flex; align-items:center; justify-content:center;
    width:2.25rem; height:2.25rem; border-radius:0.625rem; transition:all 0.2s; border:none; cursor:pointer;
  }
  .hdr-icon-btn-user { background:transparent; color:#64748B; }
  .hdr-icon-btn-user:hover { background:rgba(37,99,235,0.07); color:#2563EB; }
  .hdr-icon-btn-admin { background:rgba(255,255,255,0.06); color:rgba(248,250,252,0.55); }
  .hdr-icon-btn-admin:hover { background:rgba(59,130,246,0.15); color:#93C5FD; }

  /* Badge */
  .hdr-badge {
    position:absolute; top:2px; right:2px; min-width:16px; height:16px;
    background:#EF4444; color:#fff; font-size:0.6rem; font-weight:700;
    border-radius:999px; display:flex; align-items:center; justify-content:center; padding:0 3px;
    border:2px solid transparent;
  }
  .hdr-badge-user { border-color: rgba(255,255,255,0.95); }
  .hdr-badge-admin { border-color: rgba(15,23,42,0.95); }

  /* Balance chip - user */
  .hdr-balance {
    display:flex; align-items:center; gap:0.3rem; padding:0.3rem 0.75rem;
    background:linear-gradient(135deg,rgba(37,99,235,0.08),rgba(59,130,246,0.04));
    border:1px solid rgba(37,99,235,0.2); border-radius:999px;
    font-size:0.75rem; font-weight:600; color:#1D4ED8; white-space:nowrap;
    transition: all 0.2s;
  }
  .hdr-balance:hover { background:rgba(37,99,235,0.12); border-color:rgba(37,99,235,0.35); }

  /* User avatar button */
  .hdr-avatar-btn {
    display:flex; align-items:center; gap:0.5rem; padding:0.3rem 0.5rem 0.3rem 0.375rem;
    border-radius:0.75rem; transition:all 0.2s; border:none; cursor:pointer; background:transparent;
  }
  .hdr-avatar-btn-user:hover { background:rgba(37,99,235,0.05); }
  .hdr-avatar-btn-admin:hover { background:rgba(255,255,255,0.07); }
  .hdr-avatar {
    width:2rem; height:2rem; border-radius:0.5rem; display:flex; align-items:center; justify-content:center;
    font-size:0.875rem; font-weight:700; border:none; flex-shrink:0;
  }
  .hdr-avatar-user { background:linear-gradient(135deg,#2563EB,#1D4ED8); color:#fff; }
  .hdr-avatar-admin { background:linear-gradient(135deg,#1E293B,#0F172A); color:#93C5FD; border:1px solid rgba(59,130,246,0.3); }

  /* Dropdowns */
  .hdr-dropdown {
    position:absolute; right:0; top:calc(100% + 8px); z-index:200;
    border-radius:0.875rem; overflow:hidden;
    animation: hdrDropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .hdr-dropdown-user {
    width:220px; background:rgba(255,255,255,0.97);
    backdrop-filter:blur(20px); border:1px solid rgba(37,99,235,0.12);
    box-shadow:0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(37,99,235,0.06);
  }
  .hdr-dropdown-admin {
    width:220px; background:rgba(15,20,35,0.97);
    backdrop-filter:blur(24px); border:1px solid rgba(59,130,246,0.18);
    box-shadow:0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(59,130,246,0.08);
  }
  .hdr-dropdown-notif {
    width:320px; background:rgba(255,255,255,0.97);
    backdrop-filter:blur(20px); border:1px solid rgba(37,99,235,0.12);
    box-shadow:0 20px 60px rgba(15,23,42,0.12);
  }
  .hdr-dropdown-notif-admin {
    width:320px; background:rgba(15,20,35,0.97);
    backdrop-filter:blur(24px); border:1px solid rgba(59,130,246,0.18);
    box-shadow:0 24px 64px rgba(0,0,0,0.6);
  }
  @keyframes hdrDropIn {
    from { opacity:0; transform:translateY(-8px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .hdr-menu-item {
    display:flex; align-items:center; gap:0.625rem; width:100%;
    padding:0.625rem 1rem; font-size:0.8125rem; font-weight:500;
    transition:all 0.15s; border:none; cursor:pointer; text-align:left; text-decoration:none;
  }
  .hdr-menu-item-user { color:#334155; background:transparent; }
  .hdr-menu-item-user:hover { background:rgba(37,99,235,0.06); color:#0F172A; }
  .hdr-menu-item-admin { color:rgba(248,250,252,0.6); background:transparent; }
  .hdr-menu-item-admin:hover { background:rgba(59,130,246,0.08); color:#F8FAFC; }
  .hdr-menu-item-danger { color:#EF4444 !important; }
  .hdr-menu-item-danger:hover { background:rgba(239,68,68,0.06) !important; }
  .hdr-divider { height:1px; margin:0.25rem 0; }
  .hdr-divider-user { background:rgba(37,99,235,0.08); }
  .hdr-divider-admin { background:rgba(255,255,255,0.07); }

  /* Admin badge in header */
  .hdr-admin-tag {
    display:inline-flex; align-items:center; gap:0.25rem; padding:0.2rem 0.625rem;
    background:linear-gradient(135deg,rgba(37,99,235,0.15),rgba(59,130,246,0.06));
    border:1px solid rgba(59,130,246,0.35); border-radius:999px;
    font-size:0.65rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#3B82F6;
  }

  /* Auth buttons */
  .hdr-btn-outline {
    position:relative; overflow:hidden;
    padding:0.4rem 1rem; border-radius:0.625rem; font-size:0.8125rem; font-weight:600; cursor:pointer;
    border:1px solid rgba(37,99,235,0.35); color:#2563EB; background:transparent;
    transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .hdr-btn-outline:hover {
    border-color:#2563EB; background:rgba(37,99,235,0.06);
    transform:translateY(-1px);
  }
  .hdr-btn-outline:active { transform:translateY(0) scale(0.97); }

  .hdr-btn-primary {
    position:relative; overflow:hidden;
    padding:0.4rem 1rem; border-radius:0.625rem; font-size:0.8125rem; font-weight:600; cursor:pointer; border:none;
    background:linear-gradient(135deg,#2563EB 0%,#3B82F6 50%,#1D4ED8 100%);
    color:#fff; transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
    box-shadow:0 2px 8px rgba(37,99,235,0.35);
    animation: hdrPulseGlow 2.8s ease-in-out infinite;
  }
  .hdr-btn-primary:hover {
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 6px 20px rgba(37,99,235,0.5);
    animation: none;
  }
  .hdr-btn-primary:active { transform:translateY(0) scale(0.97); box-shadow:0 2px 8px rgba(37,99,235,0.35); }

  /* Shimmer sweep on primary button */
  .hdr-btn-primary::before {
    content:'';
    position:absolute; top:0; left:-100%; width:60%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
    transform:skewX(-15deg);
    animation: hdrShimmer 2.8s ease-in-out infinite;
  }
  .hdr-btn-primary:hover::before { animation: hdrShimmer 0.7s ease-out forwards; }

  /* Ripple */
  .hdr-ripple {
    position:absolute; border-radius:50%;
    background:rgba(255,255,255,0.35);
    transform:scale(0); pointer-events:none;
    animation: hdrRippleAnim 0.55s linear;
  }
  .hdr-btn-outline .hdr-ripple { background:rgba(37,99,235,0.18); }

  @keyframes hdrShimmer {
    0%   { left:-100%; opacity:0; }
    10%  { opacity:1; }
    50%  { left:130%; opacity:1; }
    51%,100% { left:130%; opacity:0; }
  }
  @keyframes hdrPulseGlow {
    0%,100% { box-shadow:0 2px 8px rgba(37,99,235,0.35); }
    50%     { box-shadow:0 2px 18px rgba(37,99,235,0.6), 0 0 0 3px rgba(37,99,235,0.12); }
  }
  @keyframes hdrRippleAnim {
    to { transform:scale(4); opacity:0; }
  }

  /* Notif items */
  .hdr-notif-item { padding:0.75rem 1rem; border-bottom:1px solid rgba(0,0,0,0.05); cursor:default; transition:background 0.15s; }
  .hdr-notif-item:hover { background:rgba(37,99,235,0.03); }
  .hdr-notif-item-admin { border-bottom-color:rgba(255,255,255,0.05); }
  .hdr-notif-item-admin:hover { background:rgba(59,130,246,0.05); }
  .hdr-notif-unread { background:rgba(37,99,235,0.04); }
  .hdr-notif-unread-dot { width:6px; height:6px; border-radius:50%; background:#2563EB; flex-shrink:0; margin-top:3px; }
`;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = HEADER_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
};

/* ─────────────────────────────────────────────
   ANIMATED BUTTON — ripple + shimmer + glow
───────────────────────────────────────────── */
const AnimatedButton = ({ variant = 'primary', children, onClick, style = {} }) => {
  const handleClick = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'hdr-ripple';
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}px; top:${y}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    onClick?.();
  };

  return (
    <button
      className={variant === 'primary' ? 'hdr-btn-primary' : 'hdr-btn-outline'}
      onClick={handleClick}
      style={style}
    >
      {children}
    </button>
  );
};


/* ─────────────────────────────────────────────
   MAIN HEADER
───────────────────────────────────────────── */
const Header = () => {
  injectStyles();
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const { unreadCount } = useChat();
  const { navigateTo } = usePageTransition();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin' || location.pathname.startsWith('/admin/')
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const isAdminArea = location.pathname.startsWith('/admin');

  const formatCurrency = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const handleLogout = () => { logout(); navigate('/login'); setDropdownOpen(false); };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
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
    } catch { setNotifications([]); }
    finally { setLoadingNotifications(false); }
  };

  useEffect(() => { if (notificationOpen) loadNotifications(); }, [notificationOpen, isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotificationUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  /* ── User nav links ── */
  const userNavLinks = [
    { to: '/auctions', label: 'Đấu giá' },
    ...(isAuthenticated ? [{ to: '/my-auctions', label: 'Của tôi' }] : []),
  ];

  /* ── Admin nav links ── */
  const adminNavLinks = [
    { to: '/admin', label: 'Tổng quan', icon: ICONS.grid },
    { to: '/admin/users', label: 'Người dùng', icon: ICONS.users },
    { to: '/admin/auctions', label: 'Đấu giá', icon: ICONS.hammer },
    { to: '/admin/withdrawals', label: 'Rút tiền', icon: ICONS.wallet },
  ];


  /* ══════════════════════════════
     USER HEADER
  ══════════════════════════════ */
  return (
    <header className="hdr-user">
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '3.75rem', gap: '1.5rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}>
              <Icon d={ICONS.hammer} size={16} strokeWidth={2} />
            </div>
            <div className="hdr-logo-user">Đấu Giá <span>Realtime</span></div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
            {userNavLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hdr-nav-link${isActive(to) ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`hdr-nav-link${isActive('/admin') ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                Quản trị
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            {isAuthenticated ? (
              <>
                {/* Balance */}
                {user?.availableBalance !== undefined && (
                  <Link to="/wallet" style={{ textDecoration: 'none' }}>
                    <div className="hdr-balance">
                      <Icon d={ICONS.wallet} size={13} strokeWidth={2} />
                      {formatCurrency(user.availableBalance)}
                    </div>
                  </Link>
                )}

                {/* Chat */}
                <Link
                  to="/chat"
                  className="hdr-icon-btn hdr-icon-btn-user"
                  style={{ textDecoration: 'none' }}
                  aria-label="Tin nhắn"
                >
                  <Icon d={ICONS.chat} size={18} />
                  {unreadCount > 0 && (
                    <span className="hdr-badge hdr-badge-user">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Notification */}
                <div style={{ position: 'relative' }} ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="hdr-icon-btn hdr-icon-btn-user"
                    aria-label="Thông báo"
                  >
                    <Icon d={ICONS.bell} size={18} />
                    {notificationUnread > 0 && (
                      <span className="hdr-badge hdr-badge-user">
                        {notificationUnread > 99 ? '99+' : notificationUnread}
                      </span>
                    )}
                  </button>
                  {notificationOpen && (
                    <NotificationPanel
                      admin={false}
                      loading={loadingNotifications}
                      notifications={notifications}
                      unread={notificationUnread}
                      onMarkAll={handleMarkAllRead}
                      onClose={() => setNotificationOpen(false)}
                    />
                  )}
                </div>

                {/* Avatar dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="hdr-avatar-btn hdr-avatar-btn-user"
                  >
                    <div className="hdr-avatar hdr-avatar-user">
                      {getInitials(user?.fullName)}
                    </div>
                    <div style={{ textAlign: 'left', maxWidth: 100, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1C1917', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.fullName || 'Người dùng'}
                      </div>
                    </div>
                    <div style={{ color: '#A8A29E', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                      <Icon d={ICONS.chevron} size={14} strokeWidth={2} />
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="hdr-dropdown hdr-dropdown-user">
                      <UserDropdown
                        user={user}
                        formatCurrency={formatCurrency}
                        onClose={() => setDropdownOpen(false)}
                        onLogout={handleLogout}
                        navigate={navigate}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <AnimatedButton
                  variant="outline"
                  onClick={() => navigateTo('/login', 'Đăng nhập')}
                >
                  Đăng nhập
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => navigateTo('/register', 'Đăng ký')}
                >
                  Đăng ký
                </AnimatedButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────
   USER DROPDOWN MENU
───────────────────────────────────────────── */
const UserDropdown = ({ user, formatCurrency, onClose, onLogout, navigate }) => {
  const menuItems = [
    { icon: ICONS.user, label: 'Hồ sơ của tôi', to: '/profile' },
    { icon: ICONS.wallet, label: 'Ví tiền', to: '/wallet' },
    { icon: ICONS.orders, label: 'Đơn mua', to: '/my-orders' },
    { icon: ICONS.orders, label: 'Đơn bán', to: '/my-sales' },
    { icon: ICONS.hammer, label: 'Đấu giá của tôi', to: '/my-auctions' },
    { icon: ICONS.check, label: 'Theo dõi', to: '/my-watchlist' },
  ];

  return (
    <>
      {/* User info header */}
      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1917' }}>{user?.fullName}</div>
        <div style={{ fontSize: '0.7rem', color: '#A8A29E', marginTop: 2 }}>{user?.email}</div>
        {user?.availableBalance !== undefined && (
          <div style={{
            marginTop: '0.625rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.625rem', borderRadius: '999px',
            background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))',
            border: '1px solid rgba(212,175,55,0.25)',
            fontSize: '0.7rem', fontWeight: 700, color: '#92400E',
          }}>
            <Icon d={ICONS.wallet} size={11} strokeWidth={2} />
            {formatCurrency(user.availableBalance)}
          </div>
        )}
      </div>

      {/* Menu items */}
      <div style={{ padding: '0.375rem 0' }}>
        {menuItems.map(({ icon, label, to }) => (
          <button
            key={to}
            onClick={() => { navigate(to); onClose(); }}
            className="hdr-menu-item hdr-menu-item-user"
          >
            <span style={{ opacity: 0.5 }}><Icon d={icon} size={15} strokeWidth={1.75} /></span>
            {label}
          </button>
        ))}
      </div>

      <div className="hdr-divider hdr-divider-user" />
      <div style={{ padding: '0.375rem 0' }}>
        <button onClick={onLogout} className="hdr-menu-item hdr-menu-item-user hdr-menu-item-danger">
          <Icon d={ICONS.logout} size={15} strokeWidth={1.75} />
          Đăng xuất
        </button>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   ADMIN DROPDOWN MENU
───────────────────────────────────────────── */
const AdminDropdown = ({ user, onProfile, onHome, onLogout }) => (
  <>
    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FAFAF9' }}>{user?.fullName}</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(250,250,249,0.4)', marginTop: 2 }}>{user?.email}</div>
      <div style={{
        marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.2rem 0.5rem', borderRadius: '999px',
        background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.3)',
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#3B82F6',
      }}>
        <Icon d={ICONS.shield} size={10} strokeWidth={2.5} />
        Quản trị viên
      </div>
    </div>
    <div style={{ padding: '0.375rem 0' }}>
      <button onClick={onProfile} className="hdr-menu-item hdr-menu-item-admin">
        <span style={{ opacity: 0.5 }}><Icon d={ICONS.user} size={15} /></span>
        Hồ sơ
      </button>
      <button onClick={onHome} className="hdr-menu-item hdr-menu-item-admin">
        <span style={{ opacity: 0.5 }}><Icon d={ICONS.hammer} size={15} /></span>
        Về trang người dùng
      </button>
    </div>
    <div className="hdr-divider hdr-divider-admin" />
    <div style={{ padding: '0.375rem 0' }}>
      <button onClick={onLogout} className="hdr-menu-item hdr-menu-item-admin hdr-menu-item-danger">
        <Icon d={ICONS.logout} size={15} />
        Đăng xuất
      </button>
    </div>
  </>
);

/* ─────────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────────── */
const NotificationPanel = ({ admin, loading, notifications, unread, onMarkAll }) => {
  const dropdownClass = admin ? 'hdr-dropdown hdr-dropdown-notif-admin' : 'hdr-dropdown hdr-dropdown-notif';
  const titleColor = admin ? 'rgba(248,250,252,0.9)' : '#0F172A';
  const emptyColor = admin ? 'rgba(248,250,252,0.35)' : '#94A3B8';
  const hdrBorder = admin ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(37,99,235,0.08)';

  return (
    <div className={dropdownClass}>
      {/* Header */}
      <div style={{ padding: '0.875rem 1rem', borderBottom: hdrBorder, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: titleColor }}>Thông báo</span>
        {unread > 0 && (
          <button
            onClick={onMarkAll}
            style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: emptyColor, fontSize: '0.8125rem' }}>Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: emptyColor, fontSize: '0.8125rem' }}>
            <Icon d={ICONS.bell} size={28} strokeWidth={1.25} />
            <div style={{ marginTop: '0.5rem' }}>Chưa có thông báo</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`hdr-notif-item${admin ? ' hdr-notif-item-admin' : ''}${!n.isRead ? ' hdr-notif-unread' : ''}`}
            >
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                {!n.isRead && <div className="hdr-notif-unread-dot" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: admin ? 'rgba(250,250,249,0.85)' : '#1C1917', lineHeight: 1.4 }}>{n.title}</div>
                  {n.message && <div style={{ fontSize: '0.75rem', color: emptyColor, marginTop: '0.125rem', lineHeight: 1.4 }}>{n.message}</div>}
                  <div style={{ fontSize: '0.6875rem', color: admin ? 'rgba(248,250,252,0.25)' : '#94A3B8', marginTop: '0.3rem' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Header;
