import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, firebaseDiagnostics } from '../firebase';
import { chatService } from '../services/chatService';
import { getErrorMessage } from '../utils/errorUtils';
import { sanitizeExternalUrl, sanitizeLocationPayload } from '../utils/urlSecurity';

const ChatContext = createContext(null);
const FIREBASE_AUTH_ERROR_COOLDOWN_MS = 4000;
const LAST_ACTIVE_CONVERSATION_STORAGE_KEY = 'chat:lastActiveConversationByUser';

const toId = (value) => (value == null ? '' : String(value));

const readLastActiveConversationMap = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LAST_ACTIVE_CONVERSATION_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const getStoredLastActiveConversationId = (userId) => {
  if (!userId) {
    return null;
  }

  const map = readLastActiveConversationMap();
  return typeof map[userId] === 'string' ? map[userId] : null;
};

const storeLastActiveConversationId = (userId, conversationId) => {
  if (!userId || typeof window === 'undefined') {
    return;
  }

  try {
    const map = readLastActiveConversationMap();
    if (conversationId) {
      map[userId] = conversationId;
    } else {
      delete map[userId];
    }

    window.localStorage.setItem(LAST_ACTIVE_CONVERSATION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
};

const splitName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'User', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
};

const normalizeParticipant = (participant) => {
  const id = toId(participant?.id);
  const explicitFullName = participant?.fullName || [participant?.firstName, participant?.lastName].filter(Boolean).join(' ').trim();
  const { firstName, lastName } = splitName(explicitFullName);

  return {
    id,
    firstName: participant?.firstName || firstName,
    lastName: participant?.lastName || lastName,
    fullName: explicitFullName || [firstName, lastName].filter(Boolean).join(' ').trim(),
    role: participant?.role ?? null,
  };
};

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, currentUser, enabled = false, autoSelectConversation = false }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [pendingConversation, setPendingConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUserIds, setTypingUserIds] = useState([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false);
  const authPromiseRef = useRef(null);
  const lastAuthErrorRef = useRef({ message: '', at: 0 });
  const fatalFirebaseAuthErrorRef = useRef(null);
  const launchConversationRef = useRef(0);
  const conversationsRef = useRef([]);

  const currentUserId = toId(currentUser?.id);
  const activeConversationId = activeConversation?.id || '';
  const subscriptionsEnabled = Boolean(currentUserId) && (enabled || isOpen || Boolean(activeConversation));

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const getFirebaseAuthErrorMessage = useCallback((error) => {
    if (error?.code === 'auth/configuration-not-found') {
      return 'Firebase Auth cua frontend chua co cau hinh hop le cho API key/project hien tai. Kiem tra lai Firebase Console > Authentication va Web app config.';
    }

    if (error?.code === 'auth/custom-token-mismatch') {
      return 'Firebase chat dang tro toi project khac voi custom token backend. Kiem tra lai Firebase Web API key/app config o frontend.';
    }

    return getErrorMessage(error, 'Khong the khoi tao chat luc nay');
  }, []);

  const notifyFirebaseAuthError = useCallback((error) => {
    const message = getFirebaseAuthErrorMessage(error);
    const now = Date.now();

    if (
      lastAuthErrorRef.current.message === message &&
      now - lastAuthErrorRef.current.at < FIREBASE_AUTH_ERROR_COOLDOWN_MS
    ) {
      return;
    }

    lastAuthErrorRef.current = { message, at: now };
    toast.error(message);
  }, [getFirebaseAuthErrorMessage]);

  const findConversationForTarget = useCallback((conversationList, otherUserId, auctionId) => (
    (conversationList || []).find((conversation) =>
      (conversation.participantIds || []).includes(otherUserId) &&
      (!auctionId || conversation.auctionId === auctionId))
  ), []);

  const restoreConversationVisibility = useCallback(async (conversation) => {
    if (!conversation?.id || !currentUserId) {
      return conversation;
    }

    const deletedBy = (conversation.deletedBy || []).filter((userId) => toId(userId) !== currentUserId);
    if (deletedBy.length === (conversation.deletedBy || []).length) {
      return conversation;
    }

    await updateDoc(doc(db, 'conversations', conversation.id), { deletedBy });
    return { ...conversation, deletedBy };
  }, [currentUserId]);

  const ensureFirebaseAuth = useCallback(async () => {
    if (!currentUserId) {
      return false;
    }

    if (fatalFirebaseAuthErrorRef.current) {
      throw fatalFirebaseAuthErrorRef.current;
    }

    if (auth.currentUser?.uid === currentUserId) {
      return true;
    }

    if (authPromiseRef.current) {
      return authPromiseRef.current;
    }

    authPromiseRef.current = (async () => {
      if (auth.currentUser && auth.currentUser.uid !== currentUserId) {
        await signOut(auth);
      }

      const response = await chatService.getFirebaseToken();

      if (!response?.token) {
        throw new Error('Backend khong tra ve Firebase custom token.');
      }

      const frontendProjectId = auth.app.options.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
      if (response?.projectId && frontendProjectId && response.projectId !== frontendProjectId) {
        throw new Error(
          `Firebase project mismatch: frontend=${frontendProjectId}, backend=${response.projectId}.`,
        );
      }

      try {
        await signInWithCustomToken(auth, response.token);
      } catch (error) {
        if (error?.code === 'auth/configuration-not-found') {
          fatalFirebaseAuthErrorRef.current = error;
          console.error('Firebase chat configuration is invalid for custom token sign-in.', {
            ...firebaseDiagnostics,
            backendProjectId: response?.projectId || null,
          });
        }

        throw error;
      }

      return true;
    })();

    try {
      return await authPromiseRef.current;
    } finally {
      authPromiseRef.current = null;
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      return;
    }

    setConversations([]);
    setActiveConversation(null);
    setPendingConversation(null);
    setMessages([]);
    setUnreadCount(0);
    setTypingUserIds([]);
    setIsConversationsLoading(false);
    setHasLoadedConversations(false);
    setIsOpen(false);
    fatalFirebaseAuthErrorRef.current = null;
    launchConversationRef.current += 1;

    if (auth.currentUser) {
      signOut(auth).catch(() => {});
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!subscriptionsEnabled) {
      if (!activeConversation) {
        setMessages([]);
        setTypingUserIds([]);
      }
      return undefined;
    }

    let active = true;
    ensureFirebaseAuth().catch((error) => {
      if (active) {
        console.error('Firebase auth failed:', error);
        notifyFirebaseAuthError(error);
      }
    });

    return () => {
      active = false;
    };
  }, [subscriptionsEnabled, activeConversation, ensureFirebaseAuth, notifyFirebaseAuthError]);

  useEffect(() => {
    if (!subscriptionsEnabled || !currentUserId) {
      if (!isOpen && !enabled) {
        setConversations([]);
        setUnreadCount(0);
      }
      return undefined;
    }

    let unsubscribe = () => {};
    let active = true;
    setIsConversationsLoading(true);
    setHasLoadedConversations(false);

    ensureFirebaseAuth()
      .then((authenticated) => {
        if (!authenticated || !active) return;

        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participantIds', 'array-contains', currentUserId),
        );

        unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
          const nextConversations = snapshot.docs
            .map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
            .filter((conversation) => !(conversation.deletedBy || []).includes(currentUserId));

          nextConversations.sort((a, b) => {
            const pinnedA = a.pinnedBy?.[currentUserId] ? 1 : 0;
            const pinnedB = b.pinnedBy?.[currentUserId] ? 1 : 0;
            if (pinnedA !== pinnedB) return pinnedB - pinnedA;

            const timeA = a.lastMessageTimestamp?.toDate?.() || new Date(0);
            const timeB = b.lastMessageTimestamp?.toDate?.() || new Date(0);
            return timeB - timeA;
          });

          setConversations(nextConversations);
          setHasLoadedConversations(true);
          setIsConversationsLoading(false);

          const nextUnreadCount = nextConversations.reduce(
            (sum, conversation) => sum + (Number(conversation.unreadCounts?.[currentUserId]) || 0),
            0,
          );
          setUnreadCount(nextUnreadCount);
        }, () => {
          setHasLoadedConversations(true);
          setIsConversationsLoading(false);
        });
      })
      .catch((error) => {
        console.error('Failed to subscribe conversations:', error);
        setHasLoadedConversations(true);
        setIsConversationsLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [subscriptionsEnabled, currentUserId, enabled, isOpen, ensureFirebaseAuth]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (activeConversationId) {
      storeLastActiveConversationId(currentUserId, activeConversationId);
    }
  }, [activeConversationId, currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (activeConversationId) {
      const syncedConversation = conversations.find((conversation) => conversation.id === activeConversationId);

      if (syncedConversation && syncedConversation !== activeConversation) {
        setActiveConversation(syncedConversation);
        return;
      }

      if (!syncedConversation) {
        setActiveConversation(null);
        return;
      }
    }

    if (!autoSelectConversation || pendingConversation) {
      return;
    }

    if (conversations.length === 0) {
      storeLastActiveConversationId(currentUserId, null);
      return;
    }

    const storedConversationId = getStoredLastActiveConversationId(currentUserId);
    const nextConversation = conversations.find((conversation) => conversation.id === storedConversationId)
      || conversations[0];

    if (nextConversation && nextConversation.id !== activeConversationId) {
      setActiveConversation(nextConversation);
    }
  }, [
    activeConversation,
    activeConversationId,
    autoSelectConversation,
    conversations,
    currentUserId,
    pendingConversation,
  ]);

  useEffect(() => {
    if (!activeConversation?.id || !currentUserId) {
      setMessages([]);
      setTypingUserIds([]);
      return undefined;
    }

    let messageUnsubscribe = () => {};
    let conversationUnsubscribe = () => {};
    let active = true;

    ensureFirebaseAuth()
      .then(async (authenticated) => {
        if (!authenticated || !active) return;

        const conversationRef = doc(db, 'conversations', activeConversation.id);
        const conversationSnapshot = await getDoc(conversationRef).catch(() => null);
        const conversationData = conversationSnapshot?.data?.() || {};
        const unreadCounts = { ...(conversationData.unreadCounts || {}), [currentUserId]: 0 };
        updateDoc(conversationRef, { unreadCounts }).catch(() => {});

        const messagesQuery = query(
          collection(db, `conversations/${activeConversation.id}/messages`),
          orderBy('timestamp', 'asc'),
        );

        messageUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const nextMessages = snapshot.docs
            .map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
            .filter((message) => !message.unsentAt && !(message.deletedBy || []).includes(currentUserId));

          setMessages(nextMessages);
        });

        conversationUnsubscribe = onSnapshot(conversationRef, (snapshot) => {
          const data = snapshot?.data?.() || {};
          const typing = data.typing || {};
          const now = Date.now();
          const timeoutMs = 5000;
          const othersTyping = Object.keys(typing).filter((id) => id !== currentUserId);
          const recentTyping = othersTyping.filter((id) => {
            const timestamp = typing[id];
            const value = timestamp?.toDate ? timestamp.toDate().getTime() : Number(timestamp || 0);
            return now - value < timeoutMs;
          });

          setTypingUserIds(recentTyping);
        });
      })
      .catch((error) => {
        console.error('Failed to subscribe messages:', error);
      });

    return () => {
      active = false;
      messageUnsubscribe();
      conversationUnsubscribe();
    };
  }, [activeConversation?.id, currentUserId, ensureFirebaseAuth]);

  const setTyping = useCallback(async (isTyping) => {
    if (!activeConversation?.id || !currentUserId) return;

    try {
      await ensureFirebaseAuth();
      const conversationRef = doc(db, 'conversations', activeConversation.id);
      const conversationSnapshot = await getDoc(conversationRef);
      const data = conversationSnapshot?.data?.() || {};
      const typing = { ...(data.typing || {}) };

      if (isTyping) {
        typing[currentUserId] = serverTimestamp();
      } else {
        delete typing[currentUserId];
      }

      await updateDoc(conversationRef, { typing });
    } catch {
      // Ignore typing indicator failures.
    }
  }, [activeConversation?.id, currentUserId, ensureFirebaseAuth]);

  const startConversation = useCallback(async (otherUser, auctionId = null) => {
    if (!currentUserId) return;

    const normalizedCurrentUser = normalizeParticipant(currentUser);
    const normalizedOtherUser = normalizeParticipant(otherUser);

    if (!normalizedOtherUser.id) {
      toast.error('Khong xac dinh duoc nguoi nhan tin');
      return;
    }

    const participantIds = Array.from(new Set([normalizedCurrentUser.id, normalizedOtherUser.id]));
    const localConversation = findConversationForTarget(
      conversationsRef.current,
      normalizedOtherUser.id,
      auctionId,
    );

    setIsOpen(true);
    setMessages([]);
    setTypingUserIds([]);

    if (localConversation) {
      setPendingConversation(null);
      setActiveConversation(localConversation);
      return;
    }

    const requestId = launchConversationRef.current + 1;
    launchConversationRef.current = requestId;

    setActiveConversation(null);
    setPendingConversation({
      participants: [normalizedCurrentUser, normalizedOtherUser],
      participantIds,
      auctionId,
      isPending: true,
    });

    try {
      await ensureFirebaseAuth();

      if (launchConversationRef.current !== requestId) {
        return;
      }

      const refreshedConversation = findConversationForTarget(
        conversationsRef.current,
        normalizedOtherUser.id,
        auctionId,
      );

      if (refreshedConversation) {
        setPendingConversation(null);
        setActiveConversation(refreshedConversation);
        return;
      }

      const conversationsSnapshot = await getDocs(query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', currentUserId),
      ));

      if (launchConversationRef.current !== requestId) {
        return;
      }

      const existingConversation = conversationsSnapshot.docs
        .map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
        .find((conversation) =>
          (conversation.participantIds || []).includes(normalizedOtherUser.id) &&
          (!auctionId || conversation.auctionId === auctionId));

      if (existingConversation) {
        const restoredConversation = await restoreConversationVisibility(existingConversation);
        setPendingConversation(null);
        setActiveConversation(restoredConversation);
        return;
      }

      const conversationRef = await addDoc(collection(db, 'conversations'), {
        participants: [normalizedCurrentUser, normalizedOtherUser],
        participantIds,
        auctionId,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTimestamp: serverTimestamp(),
        unreadCounts: participantIds.reduce((acc, participantId) => ({ ...acc, [participantId]: 0 }), {}),
      });

      if (launchConversationRef.current !== requestId) {
        return;
      }

      setPendingConversation(null);
      setActiveConversation({
        id: conversationRef.id,
        participants: [normalizedCurrentUser, normalizedOtherUser],
        participantIds,
        auctionId,
      });
    } catch (error) {
      if (launchConversationRef.current !== requestId) {
        return;
      }

      console.error('Error creating conversation:', error);
      setPendingConversation(null);

      if (error?.code?.startsWith?.('auth/')) {
        notifyFirebaseAuthError(error);
      } else {
        toast.error(getErrorMessage(error, 'Khong the tao cuoc tro chuyen'));
      }
    }
  }, [currentUser, currentUserId, ensureFirebaseAuth, findConversationForTarget, notifyFirebaseAuthError, restoreConversationVisibility]);

  const sendMessage = useCallback(async (text, imageUrl = null, options = {}) => {
    if (!activeConversation?.id || !currentUserId) return;

    const {
      type = 'text',
      videoUrl = null,
      location = null,
      quickOfferPrice = null,
    } = options;

    const safeVideoUrl = videoUrl ? sanitizeExternalUrl(videoUrl) : null;
    const safeLocation = location ? sanitizeLocationPayload(location) : null;
    const hasContent = text?.trim() || imageUrl || safeVideoUrl || safeLocation || quickOfferPrice;

    if (!hasContent) return;
    if (videoUrl && !safeVideoUrl) {
      toast.error('Lien ket video khong hop le');
      return;
    }
    if (location && !safeLocation) {
      toast.error('Lien ket vi tri khong hop le');
      return;
    }

    await ensureFirebaseAuth();

    const messageCollection = collection(db, `conversations/${activeConversation.id}/messages`);
    await addDoc(messageCollection, {
      senderId: currentUserId,
      text: text || '',
      image: imageUrl || null,
      video: safeVideoUrl,
      location: safeLocation,
      type,
      quickOfferPrice: quickOfferPrice ?? null,
      timestamp: serverTimestamp(),
    });

    let lastMessage = text || '';
    if (imageUrl) lastMessage = '[Hinh anh]';
    else if (safeVideoUrl) lastMessage = '[Video]';
    else if (safeLocation) lastMessage = '[Vi tri]';
    else if (quickOfferPrice) lastMessage = `[Gia uu dai: ${Number(quickOfferPrice).toLocaleString('vi-VN')}d]`;

    const conversationRef = doc(db, 'conversations', activeConversation.id);
    const conversationSnapshot = await getDoc(conversationRef);
    const existingCounts = conversationSnapshot?.data()?.unreadCounts || {};
    const nextCounts = { ...existingCounts };

    (activeConversation.participantIds || [])
      .filter((participantId) => participantId !== currentUserId)
      .forEach((participantId) => {
        nextCounts[participantId] = (Number(nextCounts[participantId]) || 0) + 1;
      });

    await updateDoc(conversationRef, {
      lastMessage,
      lastMessageTimestamp: serverTimestamp(),
      unreadCounts: nextCounts,
    });
  }, [activeConversation, currentUserId, ensureFirebaseAuth]);

  const unsendMessage = useCallback(async (messageId) => {
    if (!activeConversation?.id) return;

    const message = messages.find((item) => item.id === messageId);
    if (!message || message.senderId !== currentUserId) return;

    const sentAt = message.timestamp?.toDate?.() || new Date(message.timestamp);
    const diffMinutes = (Date.now() - sentAt) / 60000;
    if (diffMinutes > 5) {
      toast.error('Chi co the thu hoi tin nhan trong 5 phut');
      return;
    }

    await updateDoc(doc(db, `conversations/${activeConversation.id}/messages`, messageId), {
      unsentAt: serverTimestamp(),
    });
    toast.success('Da thu hoi tin nhan');
  }, [activeConversation?.id, messages, currentUserId]);

  const deleteMessageForMe = useCallback(async (messageId) => {
    if (!activeConversation?.id) return;

    const message = messages.find((item) => item.id === messageId);
    if (!message) return;

    const deletedBy = message.deletedBy || [];
    if (deletedBy.includes(currentUserId)) return;

    await updateDoc(doc(db, `conversations/${activeConversation.id}/messages`, messageId), {
      deletedBy: [...deletedBy, currentUserId],
    });
    toast.success('Da xoa tin nhan');
  }, [activeConversation?.id, messages, currentUserId]);

  const deleteConversation = useCallback(async (conversationId) => {
    const conversationRef = doc(db, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef).catch(() => null);
    const deletedBy = snapshot?.data?.()?.deletedBy || [];

    if (!deletedBy.includes(currentUserId)) {
      await updateDoc(conversationRef, {
        deletedBy: [...deletedBy, currentUserId],
        lastMessageTimestamp: serverTimestamp(),
      });
    }

    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
      setIsOpen(false);
    }

    toast.success('Da xoa hoi thoai');
  }, [activeConversation?.id, currentUserId]);

  const pinConversation = useCallback(async (conversationId, pin = true) => {
    const conversationRef = doc(db, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef).catch(() => null);
    const pinnedBy = { ...(snapshot?.data?.()?.pinnedBy || {}) };

    if (pin) {
      pinnedBy[currentUserId] = Date.now();
    } else {
      delete pinnedBy[currentUserId];
    }

    await updateDoc(conversationRef, { pinnedBy });
    toast.success(pin ? 'Da ghim hoi thoai' : 'Da bo ghim');
  }, [currentUserId]);

  const blockUser = useCallback(async (blockedUserId) => {
    if (!currentUserId) return;

    try {
      await setDoc(doc(db, 'userBlocks', `${currentUserId}_${blockedUserId}`), {
        userId: currentUserId,
        blockedUserId: toId(blockedUserId),
        createdAt: serverTimestamp(),
      });

      if (activeConversation?.participantIds?.includes(toId(blockedUserId))) {
        setActiveConversation(null);
        setIsOpen(false);
      }

      toast.success('Da chan nguoi dung');
    } catch {
      toast.error('Khong the chan nguoi dung');
    }
  }, [activeConversation?.participantIds, currentUserId]);

  const reportConversation = useCallback(async (conversationId, reason, messageIds = []) => {
    try {
      const otherParticipant = activeConversation?.participants?.find(
        (participant) => toId(participant.id) !== currentUserId,
      );

      await addDoc(collection(db, 'reports'), {
        conversationId,
        reporterId: currentUserId,
        reportedUserId: otherParticipant ? toId(otherParticipant.id) : null,
        reason: reason || 'Khac',
        messageIds,
        createdAt: serverTimestamp(),
      });

      toast.success('Da gui bao cao');
    } catch {
      toast.error('Khong the gui bao cao');
    }
  }, [activeConversation?.participants, currentUserId]);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      launchConversationRef.current += 1;
      setPendingConversation(null);
    }

    setIsOpen((prev) => !prev);
  }, [isOpen]);

  const closeChat = useCallback(() => {
    launchConversationRef.current += 1;
    setPendingConversation(null);
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({
    conversations,
    activeConversation,
    pendingConversation,
    setActiveConversation,
    messages,
    sendMessage,
    unsendMessage,
    deleteMessageForMe,
    deleteConversation,
    pinConversation,
    blockUser,
    reportConversation,
    startConversation,
    isOpen,
    toggleChat,
    closeChat,
    currentUser,
    unreadCount,
    typingUserIds,
    setTyping,
    isConversationsLoading,
    hasLoadedConversations,
  }), [
    conversations,
    activeConversation,
    pendingConversation,
    messages,
    sendMessage,
    unsendMessage,
    deleteMessageForMe,
    deleteConversation,
    pinConversation,
    blockUser,
    reportConversation,
    startConversation,
    isOpen,
    toggleChat,
    closeChat,
    currentUser,
    unreadCount,
    typingUserIds,
    setTyping,
    isConversationsLoading,
    hasLoadedConversations,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
