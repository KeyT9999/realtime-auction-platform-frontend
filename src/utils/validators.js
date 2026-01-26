export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  return { isValid: true, message: '' };
};

export const validatePasswordStrength = (password) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = {
    score: 0,
    feedback: [],
  };

  if (minLength) strength.score++;
  else strength.feedback.push('At least 6 characters');

  if (hasUpperCase) strength.score++;
  else strength.feedback.push('One uppercase letter');

  if (hasLowerCase) strength.score++;
  else strength.feedback.push('One lowercase letter');

  if (hasNumber) strength.score++;
  else strength.feedback.push('One number');

  if (hasSpecialChar) strength.score++;
  else strength.feedback.push('One special character');

  return strength;
};

export const validateFullName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Full name must be at least 2 characters',
    };
  }
  return { isValid: true, message: '' };
};
