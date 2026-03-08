import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children, currentUser }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [typingUserIds, setTypingUserIds] = useState([]);

    // Load conversations for the current user
    useEffect(() => {
        if (!currentUser?.id) return;

        const ensureAuth = async () => {
            try {
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                if (err.code === 'auth/admin-restricted-operation') {
                    console.warn("Firebase Anonymous Auth disabled. Enable in Console -> Authentication -> Sign-in method if needed.");
                } else {
                    console.error("Firebase Auth Error:", err);
                }
            }
        };
        ensureAuth();

        // Helper to generate a consistent conversation ID
        // We can't easily query "array-contains" for complex objects or multiple fields in a way that perfectly matches a pair without a composite key
        // But we can store participants array and query array-contains 'userId'

        const q = query(
            collection(db, 'conversations'),
            where('participantIds', 'array-contains', currentUser.id.toString())
            // orderBy('lastMessageTimestamp', 'desc') // Requires index, temporarily disabled
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(c => !(c.deletedBy || []).includes(currentUser.id.toString()));
            const sorted = convs.sort((a, b) => {
                const pa = a.pinnedBy?.[currentUser.id] ? 1 : 0;
                const pb = b.pinnedBy?.[currentUser.id] ? 1 : 0;
                if (pa !== pb) return pb - pa;
                const ta = a.lastMessageTimestamp?.toDate?.() || new Date(0);
                const tb = b.lastMessageTimestamp?.toDate?.() || new Date(0);
                return tb - ta;
            });
            setConversations(sorted);

            const uid = currentUser.id.toString();
            const total = sorted.reduce((sum, c) => sum + (Number(c.unreadCounts?.[uid]) || 0), 0);
            setUnreadCount(total);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Load messages when active conversation changes + mark as read
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        const convRef = doc(db, 'conversations', activeConversation.id);
        const uid = currentUser?.id?.toString();
        if (uid) {
            getDoc(convRef).then(snap => {
                const data = snap?.data?.() || {};
                const unreadCounts = { ...(data.unreadCounts || {}), [uid]: 0 };
                updateDoc(convRef, { unreadCounts }).catch(() => {});
            }).catch(() => {});
        }

        const q = query(
            collection(db, `conversations/${activeConversation.id}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(m => !m.unsentAt && !(m.deletedBy || []).includes(currentUser.id.toString()));
            setMessages(msgs);
        });

        // Subscribe to conversation doc for typing indicators
        const convUnsub = onSnapshot(convRef, (snap) => {
            const data = snap?.data?.() || {};
            const typing = data.typing || {};
            const uid = currentUser?.id?.toString();
            const others = Object.keys(typing).filter(id => id !== uid);
            const now = Date.now();
            const TYPING_TIMEOUT_MS = 5000;
            const recent = others.filter(id => {
                const t = typing[id];
                const ts = t?.toDate ? t.toDate().getTime() : (t || 0);
                return now - ts < TYPING_TIMEOUT_MS;
            });
            setTypingUserIds(recent);
        });

        return () => {
            unsubscribe();
            convUnsub();
        };
    }, [activeConversation]);

    const setTyping = async (isTyping) => {
        if (!activeConversation) return;
        const convRef = doc(db, 'conversations', activeConversation.id);
        const uid = currentUser?.id?.toString();
        if (!uid) return;
        try {
            const snap = await getDoc(convRef);
            const data = snap?.data?.() || {};
            const typing = { ...(data.typing || {}) };
            if (isTyping) typing[uid] = serverTimestamp();
            else delete typing[uid];
            await updateDoc(convRef, { typing });
        } catch (_) {}
    };

    const startConversation = async (otherUser, auctionId = null) => {
        if (!currentUser) return;

        // Ensure firebase is ready
        if (!auth.currentUser) {
            try {
                await signInAnonymously(auth);
            } catch (e) {
                console.warn("Auth failed but proceeding (rules might be public)", e);
                // Proceed anyway since rules might be 'if true'
            }
        }

        // Check if conversation already exists
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
            // Create new
            const cuid = currentUser.id.toString();
            const oid = otherUser.id.toString();
            const newDocRef = await addDoc(collection(db, 'conversations'), {
                participants: [currentUser, otherUser],
                participantIds: [cuid, oid],
                auctionId: auctionId,
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastMessageTimestamp: serverTimestamp(),
                unreadCounts: { [cuid]: 0, [oid]: 0 }
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
                toast.error("Lỗi quyền truy cập! Vui lòng kiểm tra Firestore Rules (allow read, write: if true).");
            } else {
                toast.error("Không thể tạo cuộc trò chuyện: " + error.message);
            }
        }
    };

    const sendMessage = async (text, imageUrl = null, options = {}) => {
        const { type = 'text', videoUrl = null, location = null, quickOfferPrice = null } = options;
        if (!activeConversation) return;
        const hasContent = text?.trim() || imageUrl || videoUrl || location || quickOfferPrice;
        if (!hasContent) return;

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
        const cuid = currentUser.id.toString();
        const otherIds = (activeConversation.participantIds || []).filter(id => id !== cuid);
        const convSnap = await getDoc(convRef);
        const existingCounts = convSnap?.data()?.unreadCounts || {};
        const newCounts = { ...existingCounts };
        otherIds.forEach(oid => { newCounts[oid] = (Number(newCounts[oid]) || 0) + 1; });
        await updateDoc(convRef, {
            lastMessage: lastMsg,
            lastMessageTimestamp: serverTimestamp(),
            unreadCounts: newCounts
        });
    };

    const unsendMessage = async (messageId) => {
        if (!activeConversation) return;
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
    };

    const deleteMessageForMe = async (messageId) => {
        if (!activeConversation) return;
        const msgRef = doc(db, `conversations/${activeConversation.id}/messages`, messageId);
        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;
        const deletedBy = msg.deletedBy || [];
        if (deletedBy.includes(currentUser.id.toString())) return;
        await updateDoc(msgRef, { deletedBy: [...deletedBy, currentUser.id.toString()] });
        toast.success('Đã xóa tin nhắn');
    };

    const deleteConversation = async (convId) => {
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
    };

    const pinConversation = async (convId, pin = true) => {
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
    };

    const blockUser = async (blockedUserId) => {
        if (!currentUser) return;
        try {
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
    };

    const reportConversation = async (convId, reason, messageIds = []) => {
        try {
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
    };

    const toggleChat = () => setIsOpen(prev => !prev);

    const closeChat = () => setIsOpen(false);

    return (
        <ChatContext.Provider value={{
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
            currentUser,
            unreadCount,
            typingUserIds,
            setTyping
        }}>
            {children}
        </ChatContext.Provider>
    );
};
