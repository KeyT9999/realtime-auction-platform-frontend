import Section from '../components/common/Section';
import Accordion from '../components/common/Accordion';

const FAQ = () => {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click on "Sign Up" in the navigation menu, enter your email address and password, or use Google authentication for a quicker signup. You\'ll need to verify your email address before you can start bidding.',
    },
    {
      question: 'Is the platform secure?',
      answer: 'Yes, we take security seriously. We use industry-standard encryption, JWT tokens for authentication, and follow best practices for data protection. Your personal information and transactions are secure.',
    },
    {
      question: 'How does real-time bidding work?',
      answer: 'Our platform uses real-time communication technology to instantly update all users when a bid is placed. You\'ll see bid updates immediately, and you can place your own bids in real-time.',
    },
    {
      question: 'What happens if I win an auction?',
      answer: 'If you win an auction, you\'ll receive a notification. You\'ll then need to complete the payment process as specified in the auction details. Once payment is confirmed, the seller will coordinate item delivery.',
    },
    {
      question: 'Can I cancel a bid?',
      answer: 'Bids are generally final once placed. However, if you have concerns about a bid you\'ve placed, please contact our support team as soon as possible. We\'ll review your case on an individual basis.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'If you\'ve forgotten your password, click on "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'Payment methods vary by auction. Check the auction details for accepted payment methods. Common methods include credit cards, bank transfers, and digital payment platforms.',
    },
    {
      question: 'Can I change my account information?',
      answer: 'Yes! You can update your profile information, including your name, phone number, and address, from your Profile page. Some information like email may require additional verification.',
    },
    {
      question: 'What if I have a problem with my account?',
      answer: 'If you experience any issues with your account, please contact our support team through the Contact page. We\'re here to help and will respond to your inquiry as soon as possible.',
    },
    {
      question: 'Are there any fees for using the platform?',
      answer: 'Platform fees vary depending on the auction. Check the auction details for any applicable fees. Some auctions may have buyer\'s premiums or platform fees that will be clearly stated.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Section
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our platform"
        className="bg-background pt-20"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Accordion key={index} title={faq.question}>
              <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
            </Accordion>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default FAQ;
