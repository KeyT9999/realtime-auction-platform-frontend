import Section from '../components/common/Section';
import Card from '../components/common/Card';
import FeatureCard from '../components/common/FeatureCard';

const About = () => {
  const values = [
    {
      icon: '🤝',
      title: 'Trust',
      description: 'We prioritize security and transparency in every transaction.',
    },
    {
      icon: '🔍',
      title: 'Transparency',
      description: 'Clear processes and honest communication with our users.',
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology.',
    },
    {
      icon: '👤',
      title: 'User-Focused',
      description: 'Your experience and satisfaction are at the heart of everything we do.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <Section className="bg-background-secondary pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            About Realtime Auction Platform
          </h1>
          <p className="text-xl text-text-secondary">
            We're building the future of online auctions with real-time technology and user-centric design.
          </p>
        </div>
      </Section>

      {/* Mission Statement */}
      <Section title="Our Mission" className="bg-background">
        <Card className="max-w-4xl mx-auto">
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            Our mission is to provide a secure, exciting, and accessible auction platform that connects buyers and sellers in real-time. We believe that everyone should have access to a fair and transparent bidding experience.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed">
            We combine cutting-edge technology with user-friendly design to create an auction platform that is both powerful and easy to use. Whether you're a seasoned bidder or new to auctions, our platform is designed to make your experience smooth and enjoyable.
          </p>
        </Card>
      </Section>

      {/* Our Story */}
      <Section title="Our Story" className="bg-background-secondary">
        <Card className="max-w-4xl mx-auto">
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            Realtime Auction Platform was born from a vision to revolutionize the online auction experience. We recognized that traditional auction platforms lacked real-time interactivity and modern user experience.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            With a team passionate about technology and user experience, we set out to build a platform that combines the excitement of live auctions with the convenience of online platforms. Our platform leverages real-time communication technology to create an immersive bidding experience.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed">
            Today, we continue to innovate and improve, always keeping our users' needs at the forefront of our development process.
          </p>
        </Card>
      </Section>

      {/* Values */}
      <Section
        title="Our Core Values"
        subtitle="The principles that guide everything we do"
        className="bg-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <FeatureCard
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default About;
