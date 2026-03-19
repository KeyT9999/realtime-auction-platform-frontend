import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';

/* Material Symbols icon helper */
const MIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 20 }}>{name}</span>
);

const sidebarLinks = [
  { to: '/admin', label: 'Tổng quan', icon: 'dashboard' },
  { to: '/admin/auctions', label: 'Đấu giá', icon: 'gavel' },
  { to: '/admin/users', label: 'Người dùng', icon: 'group' },
  { to: '/admin/categories', label: 'Danh mục', icon: 'category' },
  { to: '/admin/withdrawals', label: 'Rút tiền', icon: 'account_balance_wallet' },
  { to: '/admin/disputes', label: 'Tranh chấp', icon: 'balance' },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-display transition-colors duration-300">
      {/* Google Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Header />

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          {/* Logo */}
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-icon">
              <MIcon name="gavel" className="text-slate-900" />
            </div>
            <h1 className="admin-sidebar-logo-text">AuctionAdmin</h1>
          </div>

          {/* Nav links */}
          <nav className="admin-sidebar-nav">
            {sidebarLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`admin-sidebar-link ${isActive(to) ? 'active' : ''}`}
              >
                <MIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="admin-sidebar-footer">
            <button onClick={handleLogout} className="admin-sidebar-logout">
              <MIcon name="logout" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <Footer />

      <style>{`
        .admin-sidebar {
          width: 256px;
          background: #0f172a; /* slate-900 */
          border-right: 1px solid #1e293b; /* slate-800 */
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 64px; /* below header */
          height: calc(100vh - 64px);
          flex-shrink: 0;
          z-index: 40;
        }
        .admin-sidebar-logo {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-sidebar-logo-icon {
          width: 2.25rem;
          height: 2.25rem;
          background: linear-gradient(135deg, #f59e0b, #d97706); /* amber-500 to amber-600 */
          border-radius: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }
        .admin-sidebar-logo-icon .material-symbols-outlined {
          font-size: 18px !important;
          font-weight: 700;
        }
        .admin-sidebar-logo-text {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f8fafc; /* slate-50 */
        }
        .admin-sidebar-nav {
          flex: 1;
          padding: 0 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          border-radius: 0.75rem;
          color: #94a3b8; /* slate-400 */
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .admin-sidebar-link:hover {
          background: rgba(30, 41, 59, 0.8); /* slate-800 */
          color: #f1f5f9; /* slate-100 */
        }
        .admin-sidebar-link.active {
          background: rgba(245, 158, 11, 0.1); /* amber-500/10 */
          color: #f59e0b; /* amber-500 */
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .admin-sidebar-link.active .material-symbols-outlined {
          color: #f59e0b;
        }
        .admin-sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid #1e293b; /* slate-800 */
        }
        .admin-sidebar-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          border-radius: 0.75rem;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          width: 100%;
          border: 1px solid transparent;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-sidebar-logout:hover {
          color: #f43f5e; /* rose-500 */
          background: rgba(225, 29, 72, 0.08); /* rose-500/10 */
          border-color: rgba(225, 29, 72, 0.2);
        }

        /* Responsive: hide sidebar on small screens */
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
