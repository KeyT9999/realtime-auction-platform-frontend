import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';

export default function RealtimeProvider({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    signalRService.startConnection();
  }, []);

  const ensureUserGroupsJoined = useCallback(() => {
    if (!user) return;
    signalRService.joinUserGroup().catch(() => {});
    if (user.role === 'Admin') {
      signalRService.joinAdminGroup().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const unsubUser = signalRService.on('UserNotification', (n) => {
      const msg = n?.message ?? n?.Message;
      if (msg) toast.info(msg);
    });

    const unsubAdmin = signalRService.on('AdminNotification', (n) => {
      if (user?.role === 'Admin') {
        const msg = n?.message ?? n?.Message;
        if (msg) toast.info(msg);
      }
    });

    const unsubSupportReply = signalRService.on('SupportReplyReceived', (p) => {
      const msg = p?.message ?? p?.Message;
      if (msg) toast.success(`Admin: ${msg}`);
    });

    const unsubSupportReceived = signalRService.on('SupportMessageReceived', (p) => {
      if (user?.role === 'Admin' && (p?.subject ?? p?.Subject)) {
        const subject = p?.subject ?? p?.Subject;
        const uid = p?.userId ?? p?.UserId;
        toast.info(`Support: ${subject} (user ${uid})`);
      }
    });

    const unsubUserWon = signalRService.on('UserWon', (data) => {
      const msg = data?.Message ?? data?.message ?? 'Chúc mừng bạn đã thắng đấu giá!';
      toast.success(msg, { autoClose: 5000 });
    });

    const unsubBalanceReleased = signalRService.on('BalanceReleased', (data) => {
      const msg = data?.Message ?? data?.message ?? 'Cọc đã được hoàn do bị vượt giá.';
      toast.info(msg);
    });

    ensureUserGroupsJoined();
    const unsubReconnected = signalRService.on('Reconnected', ensureUserGroupsJoined);

    return () => {
      unsubUser();
      unsubAdmin();
      unsubSupportReply();
      unsubSupportReceived();
      unsubUserWon();
      unsubBalanceReleased();
      unsubReconnected();
    };
  }, [user, ensureUserGroupsJoined]);

  return children;
}



