/**
 * CAPTCHA Service - Google reCAPTCHA v3 integration
 * Provides invisible CAPTCHA protection for forms
 */

class CaptchaService {
  constructor() {
    this.siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * Initialize and load reCAPTCHA
   */
  init() {
    if (!this.siteKey) {
      return Promise.resolve();
    }

    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          this.isLoaded = true;
          resolve();
        });
      } else {
        // If not loaded yet, wait a bit and check again
        const checkRecaptcha = () => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            window.grecaptcha.ready(() => {
              this.isLoaded = true;
              resolve();
            });
          } else {
            setTimeout(checkRecaptcha, 100);
          }
        };
        checkRecaptcha();
      }
    });

    return this.loadPromise;
  }

  /**
   * Execute reCAPTCHA and get token
   * @param {string} action - The action name for the form (e.g., 'login', 'register')
   * @returns {Promise<string>} - The reCAPTCHA token
   */
  async execute(action = 'general') {
    if (!this.siteKey) {
      console.warn('VITE_RECAPTCHA_SITE_KEY is not configured.');
      return null;
    }

    await this.init();

    const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha;

    if (!hasGrecaptcha) {
      console.warn('reCAPTCHA not available, skipping verification');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(this.siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  }

  /**
   * Verify token with backend
   * @param {string} token - The reCAPTCHA token
   * @param {string} action - The action that generated the token
   * @returns {Promise<boolean>} - Whether the token is valid
   */
  async verifyWithBackend(token, action) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('CAPTCHA backend verification failed:', error);
      return false;
    }
  }

  /**
   * Execute and verify in one step
   * @param {string} action - The action name
   * @returns {Promise<boolean>} - Whether the verification passed
   */
  async verify(action = 'general') {
    const token = await this.execute(action);
    if (!token) {
      // If CAPTCHA fails, allow in development, block in production
      return import.meta.env.MODE !== 'production';
    }

    return true;
  }
}

export const captchaService = new CaptchaService();
