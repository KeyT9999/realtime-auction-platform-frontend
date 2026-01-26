import Section from '../components/common/Section';
import FeatureCard from '../components/common/FeatureCard';

const Features = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Real-Time Bidding',
      description: 'Participate in live auctions with instant bid updates. See bids as they happen with real-time synchronization.',
    },
    {
      icon: '🔒',
      title: 'Secure Authentication',
      description: 'Multi-factor authentication with JWT tokens, email verification, and secure password management.',
    },
    {
      icon: '👥',
      title: 'User Management',
      description: 'Comprehensive user profiles, account settings, and personalized dashboard experience.',
    },
    {
      icon: '👑',
      title: 'Admin Panel',
      description: 'Powerful admin tools for user management, account moderation, and platform oversight.',
    },
    {
      icon: '📧',
      title: 'Email Notifications',
      description: 'Stay informed with email notifications for account activities, auction updates, and important alerts.',
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Fully responsive design that works seamlessly on desktop, tablet, and mobile devices.',
    },
    {
      icon: '🔐',
      title: 'Account Security',
      description: 'Advanced security features including account locking, role-based access control, and activity monitoring.',
    },
    {
      icon: '🌐',
      title: 'Modern Technology',
      description: 'Built with the latest technologies including React, .NET, MongoDB, and SignalR for optimal performance.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Section
        title="Platform Features"
        subtitle="Everything you need for an exceptional auction experience"
        className="bg-background pt-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Features;
