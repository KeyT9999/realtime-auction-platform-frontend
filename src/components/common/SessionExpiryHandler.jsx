import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { tokenService } from '../../services/tokenService';

export default function SessionExpiryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    apiService.setOnSessionExpired(() => {
      tokenService.clearAll();
      navigate('/login', { replace: true });
    });
    return () => apiService.setOnSessionExpired(null);
  }, [navigate]);

  return null;
}
