import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Section from '../components/common/Section';
import FeatureCard from '../components/common/FeatureCard';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mainFeatures = [
    {
      icon: '⚡',
      title: 'Real-Time Bidding',
      description: 'Experience live auctions with instant bid updates and real-time notifications.',
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Your data and transactions are protected with industry-standard security.',
    },
    {
      icon: '👥',
      title: 'User Management',
      description: 'Easy account management with profile customization and preferences.',
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Access the platform from any device, anywhere, anytime.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Account',
      description: 'Sign up in seconds with email or Google account. Verify your email to get started.',
    },
    {
      number: '2',
      title: 'Browse Auctions',
      description: 'Explore active auctions, filter by category, and find items you love.',
    },
    {
      number: '3',
      title: 'Place Bids',
      description: 'Participate in real-time bidding with instant updates and notifications.',
    },
    {
      number: '4',
      title: 'Win & Complete',
      description: 'If you win, complete the transaction securely and receive your items.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-background-secondary to-background pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Experience Real-Time Bidding
            <span className="text-primary-blue"> Like Never Before</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of users in exciting live auctions. Bid in real-time, win amazing items, and enjoy a secure, seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" className="px-8 py-3 text-lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" className="px-8 py-3 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="px-8 py-3 text-lg"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* Features Preview Section */}
      <Section
        id="features"
        title="Why Choose Our Platform"
        subtitle="Everything you need for an amazing auction experience"
        className="bg-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Section>

      {/* How It Works Section */}
      <Section
        title="How It Works"
        subtitle="Get started in just a few simple steps"
        className="bg-background-secondary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary-blue transform translate-x-4" style={{ width: 'calc(100% - 2rem)' }} />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-primary-blue text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our platform today and discover amazing items in real-time auctions.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button variant="secondary" className="px-8 py-3 text-lg bg-white text-primary-blue hover:bg-gray-100">
                Create Your Account
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard">
              <Button variant="secondary" className="px-8 py-3 text-lg bg-white text-primary-blue hover:bg-gray-100">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </Section>
    </div>
  );
};

export default Home;
