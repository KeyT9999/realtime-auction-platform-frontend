import Section from '../components/common/Section';
import Card from '../components/common/Card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Section
        title="Privacy Policy"
        subtitle="Your privacy is important to us. Learn how we collect, use, and protect your information."
        className="bg-background pt-20"
      >
        <Card className="max-w-4xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-text-secondary mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Information We Collect</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Account information (name, email, password)</li>
                <li>Profile information (phone, address)</li>
                <li>Bidding activity and transaction history</li>
                <li>Communication records with our support team</li>
                <li>Device and usage information when you access our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">2. How We Use Information</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Provide, maintain, and improve our platform services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Data Security</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication using JWT tokens</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure password storage using industry-standard hashing</li>
              </ul>
              <p className="text-text-secondary leading-relaxed">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Cookies and Tracking</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your session</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-text-secondary leading-relaxed">
                You can control cookies through your browser settings, but this may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Third-Party Services</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We may use third-party services that collect information, including:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Email service providers for notifications</li>
                <li>Authentication providers (Google OAuth)</li>
                <li>Analytics services to understand platform usage</li>
                <li>Payment processors for transaction handling</li>
              </ul>
              <p className="text-text-secondary leading-relaxed">
                These third parties have their own privacy policies. We encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Your Rights</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
              </ul>
              <p className="text-text-secondary leading-relaxed">
                To exercise these rights, please contact us through our{' '}
                <a href="/contact" className="text-primary-blue hover:underline">Contact page</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">8. Children's Privacy</h2>
              <p className="text-text-secondary leading-relaxed">
                Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">9. Changes to Privacy Policy</h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Significant changes will be communicated via email or platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">10. Contact for Privacy Concerns</h2>
              <p className="text-text-secondary leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our{' '}
                <a href="/contact" className="text-primary-blue hover:underline">Contact page</a> or email us at{' '}
                <a href="mailto:privacy@realtimeauction.com" className="text-primary-blue hover:underline">
                  privacy@realtimeauction.com
                </a>.
              </p>
            </section>
          </div>
        </Card>
      </Section>
    </div>
  );
};

export default Privacy;
