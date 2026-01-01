import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function GoogleSignInButton() {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    };

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for the script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      setError('');
      await loginWithGoogle(response.credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed. Please try again.');
    }
  };

  return (
    <div className="google-signin-wrapper">
      {error && <div className="alert alert-error">{error}</div>}
      <div ref={buttonRef} className="google-signin-button"></div>
    </div>
  );
}

export default GoogleSignInButton;
