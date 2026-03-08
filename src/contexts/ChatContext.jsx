import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getDb, getAuth } from '../firebase';
import { toast } from 'react-toastify';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, currentUser }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const firebaseReady = useRef(false);
    const dbRef = useRef(null);
    const authRef = useRef(null);

    useEffect(() => {
        if (!currentUser?.id) return;

        let unsubscribe = null;

        const init = async () => {
            const [db, auth] = await Promise.all([getDb(), getAuth()]);
            dbRef.current = db;
            authRef.current = auth;
            firebaseReady.current = true;

            const { signInAnonymously } = await import('firebase/auth');
            try {
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                if (err.code !== 'auth/admin-restricted-operation') {
                    console.error("Firebase Auth Error:", err);
                }
            }

            const { collection, query, where, onSnapshot } = await import('firebase/firestore');

            const q = query(
                collection(db, 'conversations'),
                where('participantIds', 'array-contains', currentUser.id.toString())
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(c => !(c.deletedBy || []).includes(currentUser.id.toString()));
            setConversations(convs.sort((a, b) => {
                const pa = a.pinnedBy?.[currentUser.id] ? 1 : 0;
                const pb = b.pinnedBy?.[currentUser.id] ? 1 : 0;
                if (pa !== pb) return pb - pa;
                const ta = a.lastMessageTimestamp?.toDate?.() || new Date(0);
                const tb = b.lastMessageTimestamp?.toDate?.() || new Date(0);
                return tb - ta;
            }));

            });
        };

        init();

        return () => { if (unsubscribe) unsubscribe(); };
    }, [currentUser]);

    useEffect(() => {
        if (!activeConversation || !firebaseReady.current) {
            setMessages([]);
            return;
        }

        let unsubscribe = null;

        const loadMessages = async () => {
            const db = dbRef.current;
            const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');

            const q = query(
                collection(db, `conversations/${activeConversation.id}/messages`),
                orderBy('timestamp', 'asc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(m => !m.unsentAt && !(m.deletedBy || []).includes(currentUser.id.toString()));
                setMessages(msgs);
            });
        };

        loadMessages();

        return () => { if (unsubscribe) unsubscribe(); };
    }, [activeConversation]);

    const getFirestoreHelpers = useCallback(async () => {
        const db = dbRef.current || await getDb();
        const fs = await import('firebase/firestore');
        return { db, ...fs };
    }, []);

    const startConversation = useCallback(async (otherUser, auctionId = null) => {
        if (!currentUser) return;

        const auth = authRef.current || await getAuth();
        if (!auth.currentUser) {
            try {
                const { signInAnonymously } = await import('firebase/auth');
                await signInAnonymously(auth);
            } catch (e) {
                console.warn("Auth failed but proceeding", e);
            }
        }

        const existing = conversations.find(c =>
            c.participantIds.includes(otherUser.id.toString()) &&
            (!auctionId || c.auctionId === auctionId)
        );

        if (existing) {
            setActiveConversation(existing);
            setIsOpen(true);
            return;
        }

        try {
            const { db, collection, addDoc, serverTimestamp } = await getFirestoreHelpers();
            const newDocRef = await addDoc(collection(db, 'conversations'), {
                participants: [currentUser, otherUser],
                participantIds: [currentUser.id.toString(), otherUser.id.toString()],
                auctionId: auctionId,
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastMessageTimestamp: serverTimestamp()
            });

            setActiveConversation({
                id: newDocRef.id,
                participants: [currentUser, otherUser],
                participantIds: [currentUser.id.toString(), otherUser.id.toString()],
                auctionId
            });
            setIsOpen(true);
        } catch (error) {
            console.error("Error creating conversation:", error);
            if (error.code === 'permission-denied') {
                toast.error("Lỗi quyền truy cập! Vui lòng kiểm tra Firestore Rules.");
            } else {
                toast.error("Không thể tạo cuộc trò chuyện: " + error.message);
            }
        }
    }, [currentUser, conversations, getFirestoreHelpers]);

    const sendMessage = useCallback(async (text, imageUrl = null, options = {}) => {
        const { type = 'text', videoUrl = null, location = null, quickOfferPrice = null } = options;
        if (!activeConversation) return;
        const hasContent = text?.trim() || imageUrl || videoUrl || location || quickOfferPrice;
        if (!hasContent) return;

        const { db, collection, addDoc, doc, updateDoc, serverTimestamp } = await getFirestoreHelpers();
        const collectionRef = collection(db, `conversations/${activeConversation.id}/messages`);
        const payload = {
            senderId: currentUser.id.toString(),
            text: text || '',
            image: imageUrl || null,
            video: videoUrl || null,
            location: location || null,
            type: type || 'text',
            quickOfferPrice: quickOfferPrice ?? null,
            timestamp: serverTimestamp()
        };
        await addDoc(collectionRef, payload);

        let lastMsg = text || '';
        if (imageUrl) lastMsg = '[Hình ảnh]';
        else if (videoUrl) lastMsg = '[Video]';
        else if (location) lastMsg = '[Vị trí]';
        else if (quickOfferPrice) lastMsg = `[Giá ưu đãi: ${Number(quickOfferPrice).toLocaleString('vi-VN')}đ]`;

        const convRef = doc(db, 'conversations', activeConversation.id);
        await updateDoc(convRef, {
            lastMessage: lastMsg,
            lastMessageTimestamp: serverTimestamp()
        });
    }, [activeConversation, currentUser, getFirestoreHelpers]);

    const unsendMessage = useCallback(async (messageId) => {
        if (!activeConversation) return;
        const { db, doc, updateDoc, serverTimestamp } = await getFirestoreHelpers();
        const msgRef = doc(db, `conversations/${activeConversation.id}/messages`, messageId);
        const msg = messages.find(m => m.id === messageId);
        if (!msg || msg.senderId !== currentUser.id.toString()) return;
        const sentAt = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
        const diffMinutes = (Date.now() - sentAt) / 60000;
        if (diffMinutes > 5) {
            toast.error('Chỉ có thể thu hồi tin nhắn trong 5 phút');
            return;
        }
        await updateDoc(msgRef, { unsentAt: serverTimestamp() });
        toast.success('Đã thu hồi tin nhắn');
    }, [activeConversation, currentUser, messages, getFirestoreHelpers]);

    const deleteMessageForMe = useCallback(async (messageId) => {
        if (!activeConversation) return;
        const { db, doc, updateDoc } = await getFirestoreHelpers();
        const msgRef = doc(db, `conversations/${activeConversation.id}/messages`, messageId);
        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;
        const deletedBy = msg.deletedBy || [];
        if (deletedBy.includes(currentUser.id.toString())) return;
        await updateDoc(msgRef, { deletedBy: [...deletedBy, currentUser.id.toString()] });
        toast.success('Đã xóa tin nhắn');
    }, [activeConversation, currentUser, messages, getFirestoreHelpers]);

    const deleteConversation = useCallback(async (convId) => {
        const { db, doc, getDoc, updateDoc, serverTimestamp } = await getFirestoreHelpers();
        const convRef = doc(db, 'conversations', convId);
        const snap = await getDoc(convRef).catch(() => null);
        const deletedBy = snap?.data?.()?.deletedBy || [];
        if (!deletedBy.includes(currentUser.id.toString())) {
            await updateDoc(convRef, {
                deletedBy: [...deletedBy, currentUser.id.toString()],
                lastMessageTimestamp: serverTimestamp()
            });
        }
        if (activeConversation?.id === convId) {
            setActiveConversation(null);
            closeChat();
        }
        toast.success('Đã xóa hội thoại');
    }, [currentUser, activeConversation, getFirestoreHelpers]);

    const pinConversation = useCallback(async (convId, pin = true) => {
        const { db, doc, getDoc, updateDoc } = await getFirestoreHelpers();
        const convRef = doc(db, 'conversations', convId);
        const snap = await getDoc(convRef).catch(() => null);
        const pinnedBy = { ...(snap?.data?.()?.pinnedBy || {}) };
        if (pin) {
            pinnedBy[currentUser.id] = Date.now();
        } else {
            delete pinnedBy[currentUser.id];
        }
        await updateDoc(convRef, { pinnedBy });
        toast.success(pin ? 'Đã ghim hội thoại' : 'Đã bỏ ghim');
    }, [currentUser, getFirestoreHelpers]);

    const blockUser = useCallback(async (blockedUserId) => {
        if (!currentUser) return;
        try {
            const { db, doc, setDoc, serverTimestamp } = await getFirestoreHelpers();
            await setDoc(doc(db, 'userBlocks', `${currentUser.id}_${blockedUserId}`), {
                userId: currentUser.id.toString(),
                blockedUserId: blockedUserId.toString(),
                createdAt: serverTimestamp()
            });
            toast.success('Đã chặn người dùng');
            if (activeConversation?.participantIds?.includes(blockedUserId.toString())) {
                setActiveConversation(null);
                closeChat();
            }
        } catch (err) {
            toast.error('Không thể chặn');
        }
    }, [currentUser, activeConversation, getFirestoreHelpers]);

    const reportConversation = useCallback(async (convId, reason, messageIds = []) => {
        try {
            const { db, collection, addDoc, serverTimestamp } = await getFirestoreHelpers();
            const otherUser = activeConversation?.participants?.find(p => p.id.toString() !== currentUser.id.toString());
            await addDoc(collection(db, 'reports'), {
                conversationId: convId,
                reporterId: currentUser.id.toString(),
                reportedUserId: otherUser?.id?.toString(),
                reason: reason || 'Khác',
                messageIds,
                createdAt: serverTimestamp()
            });
            toast.success('Đã gửi báo cáo. Admin sẽ xem xét.');
        } catch (err) {
            toast.error('Không thể gửi báo cáo');
        }
    }, [currentUser, activeConversation, getFirestoreHelpers]);

    const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

    const closeChat = useCallback(() => setIsOpen(false), []);

    const value = useMemo(() => ({
        conversations,
        activeConversation,
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
        currentUser
    }), [conversations, activeConversation, messages, isOpen, currentUser,
         sendMessage, unsendMessage, deleteMessageForMe, deleteConversation,
         pinConversation, blockUser, reportConversation, startConversation,
         toggleChat, closeChat]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
