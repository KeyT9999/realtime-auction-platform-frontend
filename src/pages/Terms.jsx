import Section from '../components/common/Section';
import Card from '../components/common/Card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Section
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using our platform"
        className="bg-background pt-20"
      >
        <Card className="max-w-4xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-text-secondary mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Introduction</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Welcome to Realtime Auction Platform. These Terms and Conditions govern your use of our online auction platform. By accessing or using our platform, you agree to be bound by these terms.
              </p>
              <p className="text-text-secondary leading-relaxed">
                If you do not agree with any part of these terms, you must not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">2. User Responsibilities</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                As a user of our platform, you are responsible for:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and truthful information</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Respecting the rights of other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Platform Rules</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When using our platform, you agree not to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Manipulate bidding processes</li>
                <li>Use automated systems to place bids</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Bidding Terms</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When participating in auctions:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Bids are final and cannot be withdrawn once placed</li>
                <li>You are legally obligated to complete the transaction if you win</li>
                <li>All bids must be placed in good faith</li>
                <li>The platform reserves the right to cancel bids that violate our rules</li>
                <li>Winning bidders must complete payment within the specified timeframe</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Payment Terms</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Payment terms vary by auction. By placing a bid, you agree to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Complete payment if you win the auction</li>
                <li>Pay any applicable fees or premiums as specified</li>
                <li>Use only valid payment methods</li>
                <li>Accept responsibility for payment processing fees</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Dispute Resolution</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                In the event of disputes:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Contact our support team first to attempt resolution</li>
                <li>We will investigate disputes fairly and promptly</li>
                <li>Our decisions regarding disputes are final</li>
                <li>Legal disputes will be resolved according to applicable law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Changes to Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">8. Limitation of Liability</h2>
              <p className="text-text-secondary leading-relaxed">
                Our platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid to use the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">9. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                If you have questions about these Terms & Conditions, please contact us through our{' '}
                <a href="/contact" className="text-primary-blue hover:underline">Contact page</a>.
              </p>
            </section>
          </div>
        </Card>
      </Section>
    </div>
  );
};

export default Terms;
