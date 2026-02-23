import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';

export default function RealtimeProvider({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    signalRService.startConnection();
  }, []);

  useEffect(() => {
    const unsubUser = signalRService.on('UserNotification', (n) => {
      if (n?.message) toast.info(n.message);
    });

    const unsubAdmin = signalRService.on('AdminNotification', (n) => {
      if (user?.role === 'Admin' && n?.message) toast.info(n.message);
    });

    const unsubSupportReply = signalRService.on('SupportReplyReceived', (p) => {
      if (p?.message) toast.success(`Admin: ${p.message}`);
    });

    const unsubSupportReceived = signalRService.on('SupportMessageReceived', (p) => {
      if (user?.role === 'Admin' && p?.subject) {
        toast.info(`Support: ${p.subject} (user ${p.userId})`);
      }
    });

    return () => {
      unsubUser();
      unsubAdmin();
      unsubSupportReply();
      unsubSupportReceived();
    };
  }, [user?.role]);

  return children;
}



