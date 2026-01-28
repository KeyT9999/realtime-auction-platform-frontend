import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import Button from '../common/Button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-primary-blue">
              Realtime Auction
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
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/about') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  About
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
                  Features
                </Link>
                <Link
                  to="/how-it-works"
                  className={`hidden lg:block text-sm px-2 py-1 rounded transition-colors ${isActive('/how-it-works') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  How It Works
                </Link>
                <Link
                  to="/faq"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/faq') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  FAQ
                </Link>
                <Link
                  to="/contact"
                  className={`hidden md:block text-sm px-2 py-1 rounded transition-colors ${isActive('/contact') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Contact
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
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
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`text-sm sm:text-base px-2 py-1 rounded transition-colors ${isActive('/profile') ? 'text-primary-blue font-medium' : 'text-text-secondary hover:text-text-primary'
                    } hover:bg-gray-50`}
                >
                  Profile
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">
                      {user?.fullName}
                    </span>
                    {user?.role && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full hidden sm:inline ${user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="text-sm">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" className="text-sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="text-sm">Sign Up</Button>
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
