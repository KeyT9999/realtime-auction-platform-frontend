import { useEffect } from 'react';

const GoogleAuthButton = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file');
        if (onError) {
          onError(new Error('Google OAuth not configured'));
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    }
  };

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError(new Error('Google sign-in failed'));
    }
  };

  return (
    <div className="w-full">
      <div id="google-signin-button" className="w-full"></div>
    </div>
  );
};

export default GoogleAuthButton;
