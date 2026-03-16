import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';

export default function RealtimeProvider({ children }) {
  const { user } = useAuth();

  const ensureUserGroupsJoined = useCallback(() => {
    if (!user) return;

    signalRService.joinUserGroup().catch(() => {});
    if (user.role === 'Admin') {
      signalRService.joinAdminGroup().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    if (!user) {
      signalRService.stopConnection().catch(() => {});
      return undefined;
    }

    signalRService.startConnection().then(() => {
      if (active) {
        ensureUserGroupsJoined();
      }
    });

    return () => {
      active = false;
      signalRService.stopConnection().catch(() => {});
    };
  }, [user?.id, user?.role, ensureUserGroupsJoined]);

  useEffect(() => {
    if (!user) return undefined;

    const unsubUser = signalRService.on('UserNotification', (n) => {
      const msg = n?.message ?? n?.Message;
      if (msg) toast.info(msg);
    });

    const unsubAdmin = signalRService.on('AdminNotification', (n) => {
      if (user.role === 'Admin') {
        const msg = n?.message ?? n?.Message;
        if (msg) toast.info(msg);
      }
    });

    const unsubSupportReply = signalRService.on('SupportReplyReceived', (p) => {
      const msg = p?.message ?? p?.Message;
      if (msg) toast.success(`Admin: ${msg}`);
    });

    const unsubSupportReceived = signalRService.on('SupportMessageReceived', (p) => {
      if (user.role === 'Admin' && (p?.subject ?? p?.Subject)) {
        const subject = p?.subject ?? p?.Subject;
        const uid = p?.userId ?? p?.UserId;
        toast.info(`Support: ${subject} (user ${uid})`);
      }
    });

    const unsubUserWon = signalRService.on('UserWon', (data) => {
      const msg = data?.Message ?? data?.message ?? 'Chuc mung ban da thang dau gia!';
      toast.success(msg, { autoClose: 5000 });
    });

    const unsubBalanceReleased = signalRService.on('BalanceReleased', (data) => {
      const msg = data?.Message ?? data?.message ?? 'Coc da duoc hoan do bi vuot gia.';
      toast.info(msg);
    });

    const unsubReconnected = signalRService.on('Reconnected', ensureUserGroupsJoined);

    ensureUserGroupsJoined();

    return () => {
      unsubUser();
      unsubAdmin();
      unsubSupportReply();
      unsubSupportReceived();
      unsubUserWon();
      unsubBalanceReleased();
      unsubReconnected();
    };
  }, [user?.id, user?.role, ensureUserGroupsJoined]);

  return children;
}
