import Section from '../components/common/Section';
import Card from '../components/common/Card';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Create Your Account',
      description: 'Sign up with your email address or use Google authentication. Verify your email to activate your account and start exploring auctions.',
      details: [
        'Quick registration process',
        'Email or Google sign-in',
        'Email verification required',
      ],
    },
    {
      number: '2',
      title: 'Browse Active Auctions',
      description: 'Explore the platform and discover active auctions. Filter by category, price range, or search for specific items you\'re interested in.',
      details: [
        'View all active auctions',
        'Filter and search options',
        'Detailed item information',
      ],
    },
    {
      number: '3',
      title: 'Place Your Bids',
      description: 'Participate in real-time bidding. Watch as bids update instantly, and place your bids with confidence. Receive notifications for important updates.',
      details: [
        'Real-time bid updates',
        'Instant notifications',
        'Secure bidding process',
      ],
    },
    {
      number: '4',
      title: 'Win & Complete Transaction',
      description: 'If you win an auction, complete the transaction securely. Follow the payment process and receive your items as specified.',
      details: [
        'Secure payment processing',
        'Transaction confirmation',
        'Item delivery coordination',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Section
        title="How It Works"
        subtitle="Get started with our platform in four simple steps"
        className="bg-background pt-20"
      >
        <div className="space-y-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary-blue text-white rounded-full flex items-center justify-center text-3xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-lg text-text-secondary mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-text-secondary">
                          <span className="text-primary-blue mr-2">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-10 top-20 w-0.5 h-full bg-border z-0" style={{ height: 'calc(100% + 2rem)' }} />
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default HowItWorks;
