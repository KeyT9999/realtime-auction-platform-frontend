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
    setDoc,
    getDocs,
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
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(convs);

            // Calculate total unread (primitive logic)
            // A defined 'unreadCounts' map within the convo doc is better: { [userId]: count }
            // For now, let's keep it simple or implement if needed.
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, `conversations/${activeConversation.id}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeConversation]);

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
                toast.error("Lỗi quyền truy cập! Vui lòng kiểm tra Firestore Rules (allow read, write: if true).");
            } else {
                toast.error("Không thể tạo cuộc trò chuyện: " + error.message);
            }
        }
    };

    const sendMessage = async (text, imageUrl = null) => {
        if (!activeConversation || (!text?.trim() && !imageUrl)) return;

        const collectionRef = collection(db, `conversations/${activeConversation.id}/messages`);
        await addDoc(collectionRef, {
            senderId: currentUser.id.toString(),
            text: text || '',
            image: imageUrl || null,
            timestamp: serverTimestamp()
        });

        // Update conversation last message
        const convRef = doc(db, 'conversations', activeConversation.id);
        await updateDoc(convRef, {
            lastMessage: imageUrl ? '[Hình ảnh]' : text,
            lastMessageTimestamp: serverTimestamp()
        });
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
            startConversation,
            isOpen,
            toggleChat,
            closeChat,
            currentUser
        }}>
            {children}
        </ChatContext.Provider>
    );
};
