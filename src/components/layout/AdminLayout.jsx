import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';

/* Material Symbols icon helper */
const MIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 20 }}>{name}</span>
);

const sidebarLinks = [
  { to: '/admin',             label: 'Tổng quan',   icon: 'dashboard' },
  { to: '/admin/auctions',    label: 'Đấu giá',     icon: 'gavel' },
  { to: '/admin/users',       label: 'Người dùng',   icon: 'group' },
  { to: '/admin/categories',  label: 'Danh mục',     icon: 'category' },
  { to: '/admin/withdrawals', label: 'Rút tiền',     icon: 'account_balance_wallet' },
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
    <div className="min-h-screen flex flex-col">
      {/* Google Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Header />

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          {/* Logo */}
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-icon">
              <MIcon name="gavel" className="text-white" />
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
          background: #fff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 60px; /* below header */
          height: calc(100vh - 60px);
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
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(37,99,235,0.35);
        }
        .admin-sidebar-logo-icon .material-symbols-outlined {
          font-size: 16px !important;
        }
        .admin-sidebar-logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .admin-sidebar-nav {
          flex: 1;
          padding: 0 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .admin-sidebar-link:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .admin-sidebar-link.active {
          background: rgba(37,99,235,0.08);
          color: #2563EB;
          font-weight: 600;
        }
        .admin-sidebar-link.active .material-symbols-outlined {
          color: #2563EB;
        }
        .admin-sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        .admin-sidebar-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .admin-sidebar-logout:hover {
          color: #ef4444;
          background: #fef2f2;
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
