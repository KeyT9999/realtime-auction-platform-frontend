import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'About', path: '/about' },
      { label: 'Features', path: '/features' },
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'FAQ', path: '/faq' },
    ],
    support: [
      { label: 'Contact', path: '/contact' },
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  };

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Platform Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Realtime Auction Platform
            </h3>
            <p className="text-text-secondary text-sm">
              Experience real-time bidding like never before. Join thousands of users in exciting live auctions.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-text-secondary text-sm hover:text-primary-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-text-secondary text-sm hover:text-primary-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="text-center text-text-secondary text-sm">
            <p>&copy; {currentYear} Realtime Auction Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
