import { useState } from 'react';
import Section from '../components/common/Section';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { validateEmail, validateFullName } from '../utils/validators';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccess(false);
  };

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateFullName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.subject || formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    // Simulate form submission (since we don't have backend endpoint yet)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Section
        title="Contact Us"
        subtitle="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        className="bg-background pt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <h3 className="text-2xl font-semibold text-text-primary mb-6">
              Send us a Message
            </h3>
            {success && (
              <Alert type="success" className="mb-4">
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}
            {error && (
              <Alert type="error" className="mb-4">
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                required
              />
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                placeholder="What is this regarding?"
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`input-field ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your message..."
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>
              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-2xl font-semibold text-text-primary mb-6">
              Get in Touch
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Email</h4>
                <p className="text-text-secondary">
                  <a href="mailto:support@realtimeauction.com" className="text-primary-blue hover:underline">
                    support@realtimeauction.com
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Response Time</h4>
                <p className="text-text-secondary">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Office Hours</h4>
                <p className="text-text-secondary">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday - Sunday: Closed
                </p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-text-secondary text-sm">
                  For urgent matters related to active auctions, please include your auction ID in the subject line for faster processing.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default Contact;
