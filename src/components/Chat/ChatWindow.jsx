// Mục đích tệp: Trien khai logic/chuc nang chinh cua file ChatWindow.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { auctionService } from '../../services/auctionService';
import { openSafeUrl, sanitizeExternalUrl } from '../../utils/urlSecurity';

const TYPING_DEBOUNCE_MS = 2000;

const ChatWindow = () => {
    const {
        currentUser,
        activeConversation,
        pendingConversation,
        messages,
        sendMessage,
        unsendMessage,
        deleteMessageForMe,
        deleteConversation,
        pinConversation,
        conversations,
        setActiveConversation,
        closeChat,
        typingUserIds,
        setTyping
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [convContextMenu, setConvContextMenu] = useState(null);
    const [msgContextMenu, setMsgContextMenu] = useState(null);
    const [activeProduct, setActiveProduct] = useState(null);
    const typingTimeoutRef = useRef(null);
    const displayConversation = activeConversation || pendingConversation;
    const activeAuctionId = displayConversation?.auctionId ?? null;
    const currentProduct = activeProduct && activeProduct.id === activeAuctionId ? activeProduct : null;

    useEffect(() => {
        if (!activeAuctionId) {
            setActiveProduct(null);
            return;
        }

        auctionService
            .getAuctionById(activeAuctionId)
            .then((auction) => setActiveProduct(auction))
            .catch((error) => {
                console.error(error);
            });
    }, [activeAuctionId]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = async (event) => {
        event.preventDefault();
        const trimmedMessage = newMessage.trim();

        if (!trimmedMessage) {
            return;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        setTyping(false);
        await sendMessage(trimmedMessage);
        setNewMessage('');
    };

    const handleTyping = () => {
        setTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            typingTimeoutRef.current = null;
        }, TYPING_DEBOUNCE_MS);
    };

    const getOtherParticipant = (conversation) => {
        return conversation?.participants?.find(
            (participant) => participant.id.toString() !== currentUser?.id?.toString()
        ) || { firstName: 'User', lastName: '' };
    };

    const handleBack = () => {
        setActiveConversation(null);
    };

    // UI for Loading/Pending state
    if (!activeConversation && pendingConversation) {
        const pendingOther = getOtherParticipant(pendingConversation);

        return (
            <div className="flex flex-col h-full bg-slate-900 rounded-t-lg shadow-xl overflow-hidden w-80 sm:w-96 border border-slate-800">
                <div className="bg-slate-950 p-4 text-white flex justify-between items-center rounded-t-lg border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold">
                            {pendingOther.firstName?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">{pendingOther.firstName} {pendingOther.lastName}</h3>
                            <p className="text-xs text-slate-400">Đang mở cuộc trò chuyện...</p>
                        </div>
                    </div>
                    <button onClick={closeChat} className="hover:bg-slate-800 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {currentProduct && (
                    <div className="mx-2 mt-1 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-3 backdrop-blur">
                        <div className="h-10 w-10 shrink-0 rounded border border-slate-700 bg-slate-900">
                            <img src={currentProduct.images?.[0]} alt="" className="h-full w-full rounded-sm object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">{currentProduct.title}</p>
                            <p className="text-xs font-bold text-amber-500">{currentProduct.currentPrice?.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-amber-500" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Đang mở chat với người bán</p>
                        <p className="text-xs text-slate-400">Hệ thống đang kết nối và tải cuộc trò chuyện.</p>
                    </div>
                </div>

                <div className="border-t border-slate-800 bg-slate-950 p-3">
                    <input
                        type="text"
                        disabled
                        value=""
                        placeholder="Đang kết nối chat..."
                        className="w-full cursor-not-allowed rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-500 outline-none"
                    />
                </div>
            </div>
        );
    }

    // UI for Conversation List
    if (!activeConversation) {
        return (
            <div className="flex h-full w-80 flex-col overflow-hidden rounded-t-lg border border-slate-800 bg-slate-900 shadow-xl sm:w-96">
                <div className="flex items-center justify-between rounded-t-lg bg-slate-950 p-4 text-white">
                    <h3 className="font-bold">Tin nhắn</h3>
                    <button onClick={closeChat} className="rounded p-1 hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 mt-10">
                            <p>Chưa có cuộc trò chuyện nào.</p>
                        </div>
                    ) : (
                        conversations.map((conversation) => {
                            const other = getOtherParticipant(conversation);
                            const isPinned = Boolean(conversation.pinnedBy?.[currentUser?.id]);

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => {
                                        setActiveConversation(conversation);
                                        setConvContextMenu(null);
                                    }}
                                    onContextMenu={(event) => {
                                        event.preventDefault();
                                        setConvContextMenu(conversation.id);
                                    }}
                                    className="p-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors relative"
                                >
                                    {isPinned && <span className="absolute top-2 right-2 text-amber-500 text-xs">📌 Pin</span>}
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                        {other.firstName?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-white truncate">{other.firstName} {other.lastName}</p>
                                        <p className="text-sm text-slate-500 truncate">{conversation.lastMessage || 'Bắt đầu cuộc trò chuyện'}</p>
                                    </div>

                                    {convContextMenu === conversation.id && (
                                        <div className="absolute right-2 top-12 z-20 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 min-w-[140px]">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    pinConversation(conversation.id, !isPinned);
                                                    setConvContextMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 text-white"
                                            >
                                                {isPinned ? 'Bỏ ghim' : 'Ghim'}
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (window.confirm('Xóa hội thoại?')) {
                                                        deleteConversation(conversation.id);
                                                    }
                                                    setConvContextMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-700"
                                            >
                                                Xóa hội thoại
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-2 border-t border-slate-800 text-center bg-slate-950">
                    <Link to="/chat" onClick={closeChat} className="text-sm text-amber-500 hover:text-amber-400 font-semibold block w-full py-1">
                        Xem tất cả tin nhắn
                    </Link>
                </div>
            </div>
        );
    }

    const other = getOtherParticipant(activeConversation);

    // UI for Active Chat
    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-t-lg shadow-xl overflow-hidden w-80 sm:w-96 border border-slate-800">
            <div className="bg-slate-950 p-3 text-white flex justify-between items-center shadow-sm border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} className="hover:bg-slate-800 p-1 rounded mr-1 text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                        {other.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">{other.firstName} {other.lastName}</h3>
                    </div>
                </div>
                <button onClick={closeChat} className="hover:bg-slate-800 p-1 rounded text-slate-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Product Context Mini Bar */}
            {currentProduct && (
                <div className="mx-2 mt-1 p-3 rounded-xl bg-slate-800/70 backdrop-blur border border-slate-700 flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-900 rounded border border-slate-700 shrink-0">
                        <img src={currentProduct.images?.[0]} alt="" className="w-full h-full object-cover rounded-sm" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-white">{currentProduct.title}</p>
                        <p className="text-xs font-bold text-amber-500">{currentProduct.currentPrice?.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 border-t-0 space-y-3 flex flex-col">
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUser.id.toString();
                    const safeImageUrl = sanitizeExternalUrl(message.image);
                    const safeVideoUrl = sanitizeExternalUrl(message.video);
                    const safeLocationUrl = sanitizeExternalUrl(message.location?.url);

                    return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`px-4 py-2 text-sm max-w-[80%] rounded-2xl relative cursor-pointer ${isOwn
                                    ? 'bg-amber-500 text-slate-900 rounded-br-sm hover:bg-amber-600'
                                    : 'bg-slate-800 border border-slate-700 text-white rounded-bl-sm hover:bg-slate-700'
                                    }`}
                                onClick={() => setMsgContextMenu(msgContextMenu === message.id ? null : message.id)}
                            >
                                {safeImageUrl && <img src={safeImageUrl} alt="Sent" className="max-w-full max-h-[200px] rounded-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); openSafeUrl(safeImageUrl); }} />}
                                {safeVideoUrl && <a href={safeVideoUrl} target="_blank" rel="noreferrer" className={`${isOwn ? 'text-slate-900' : 'text-amber-500'} text-xs`} onClick={e => e.stopPropagation()}>🎬 Xem video</a>}
                                {safeLocationUrl && <a href={safeLocationUrl} target="_blank" rel="noreferrer" className={`${isOwn ? 'text-slate-900' : 'text-amber-500'} text-xs`} onClick={e => e.stopPropagation()}>📍 Xem vị trí</a>}
                                {message.quickOfferPrice && <span className={`font-bold ${isOwn ? 'text-amber-900' : 'text-amber-600'}`}>💰 {Number(message.quickOfferPrice).toLocaleString('vi-VN')}đ</span>}
                                {!safeImageUrl && !safeVideoUrl && !safeLocationUrl && !message.quickOfferPrice && message.text}

                                {msgContextMenu === message.id && (
                                    <div className="mt-1 flex gap-2 border-t border-slate-700 pt-1 mt-1">
                                        {isOwn && <button onClick={(e) => { e.stopPropagation(); unsendMessage(message.id); setMsgContextMenu(null); }} className={`text-xs ${isOwn ? 'text-amber-900' : 'text-amber-400'} hover:underline`}>Thu hồi</button>}
                                        <button onClick={(e) => { e.stopPropagation(); deleteMessageForMe(message.id); setMsgContextMenu(null); }} className="text-xs text-red-500 hover:underline">Xóa</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {typingUserIds?.length > 0 && (
                    <div className="flex justify-start">
                        <span className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-full italic">
                            Đang gõ...
                        </span>
                    </div>
                )}

                <div id="scroll-to-bottom" />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => {
                        setNewMessage(event.target.value);
                        handleTyping();
                    }}
                    onBlur={() => {
                        if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                        }
                        setTyping(false);
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-slate-900 text-white placeholder-slate-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-amber-500 text-slate-900 p-2 rounded-full hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
