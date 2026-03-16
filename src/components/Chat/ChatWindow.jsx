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

    if (!activeConversation && pendingConversation) {
        const pendingOther = getOtherParticipant(pendingConversation);

        return (
            <div className="flex h-full w-80 flex-col overflow-hidden rounded-t-lg border border-gray-200 bg-white shadow-xl sm:w-96">
                <div className="flex items-center justify-between bg-blue-600 p-3 text-white shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-bold">
                            {pendingOther.firstName?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">{pendingOther.firstName} {pendingOther.lastName}</h3>
                            <p className="text-xs text-white/80">Dang mo cuoc tro chuyen...</p>
                        </div>
                    </div>
                    <button onClick={closeChat} className="rounded p-1 hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {currentProduct && (
                    <div className="mx-2 mt-1 flex items-center gap-2 rounded-xl border border-white/50 bg-white/70 p-3 backdrop-blur">
                        <div className="h-10 w-10 shrink-0 rounded border border-gray-200 bg-white">
                            <img src={currentProduct.images?.[0]} alt="" className="h-full w-full rounded-sm object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-800">{currentProduct.title}</p>
                            <p className="text-xs font-bold text-red-600">{currentProduct.currentPrice?.toLocaleString('vi-VN')} d</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-800">Dang mo chat voi nguoi ban</p>
                        <p className="text-xs text-gray-500">Mini chat da mo ngay. He thong dang ket noi va tai cuoc tro chuyen o nen.</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 bg-white p-3">
                    <input
                        type="text"
                        disabled
                        value=""
                        placeholder="Dang ket noi chat..."
                        className="w-full cursor-not-allowed rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-400 outline-none"
                    />
                </div>
            </div>
        );
    }

    if (!activeConversation) {
        return (
            <div className="flex h-full w-80 flex-col overflow-hidden rounded-t-lg border border-gray-200 bg-white shadow-xl sm:w-96">
                <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white">
                    <h3 className="font-bold">Tin nhan</h3>
                    <button onClick={closeChat} className="rounded p-1 hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="mt-10 p-4 text-center text-gray-500">
                            <p>Chua co cuoc tro chuyen nao.</p>
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
                                    className="relative flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-gray-50"
                                >
                                    {isPinned && <span className="absolute right-2 top-2 text-xs text-amber-500">Pin</span>}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                                        {other.firstName?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="truncate font-semibold text-gray-800">{other.firstName} {other.lastName}</p>
                                        <p className="truncate text-sm text-gray-500">{conversation.lastMessage || 'Bat dau cuoc tro chuyen'}</p>
                                    </div>

                                    {convContextMenu === conversation.id && (
                                        <div className="absolute right-2 top-12 z-20 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    pinConversation(conversation.id, !isPinned);
                                                    setConvContextMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                            >
                                                {isPinned ? 'Bo ghim' : 'Ghim'}
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (window.confirm('Xoa hoi thoai?')) {
                                                        deleteConversation(conversation.id);
                                                    }
                                                    setConvContextMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                                            >
                                                Xoa hoi thoai
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t bg-gray-50 p-2 text-center">
                    <Link to="/chat" onClick={closeChat} className="block w-full py-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Xem tat ca tin nhan
                    </Link>
                </div>
            </div>
        );
    }

    const other = getOtherParticipant(activeConversation);

    return (
        <div className="flex h-full w-80 flex-col overflow-hidden rounded-t-lg border border-gray-200 bg-white shadow-xl sm:w-96">
            <div className="flex items-center justify-between bg-blue-600 p-3 text-white shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} className="mr-1 rounded p-1 hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-bold">
                        {other.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">{other.firstName} {other.lastName}</h3>
                    </div>
                </div>
                <button onClick={closeChat} className="rounded p-1 hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {currentProduct && (
                <div className="mx-2 mt-1 flex items-center gap-2 rounded-xl border border-white/50 bg-white/70 p-3 backdrop-blur">
                    <div className="h-10 w-10 shrink-0 rounded border border-gray-200 bg-white">
                        <img src={currentProduct.images?.[0]} alt="" className="h-full w-full rounded-sm object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">{currentProduct.title}</p>
                        <p className="text-xs font-bold text-red-600">{currentProduct.currentPrice?.toLocaleString('vi-VN')} d</p>
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col space-y-3 overflow-y-auto bg-gray-50 p-4">
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUser?.id?.toString();
                    const safeImageUrl = sanitizeExternalUrl(message.image);
                    const safeVideoUrl = sanitizeExternalUrl(message.video);
                    const safeLocationUrl = sanitizeExternalUrl(message.location?.url);

                    return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`relative max-w-[80%] cursor-pointer rounded-2xl px-4 py-2 text-sm ${isOwn
                                    ? 'rounded-br-sm bg-yellow-100 text-gray-900 hover:bg-yellow-200'
                                    : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50'}`}
                                onClick={() => setMsgContextMenu(msgContextMenu === message.id ? null : message.id)}
                            >
                                {safeImageUrl && (
                                    <img
                                        src={safeImageUrl}
                                        alt="Sent"
                                        className="max-h-[200px] max-w-full cursor-pointer rounded-lg"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openSafeUrl(safeImageUrl);
                                        }}
                                    />
                                )}
                                {safeVideoUrl && (
                                    <a
                                        href={safeVideoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        Xem video
                                    </a>
                                )}
                                {safeLocationUrl && (
                                    <a
                                        href={safeLocationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        Xem vi tri
                                    </a>
                                )}
                                {message.quickOfferPrice && (
                                    <span className="font-bold text-amber-700">
                                        {Number(message.quickOfferPrice).toLocaleString('vi-VN')} d
                                    </span>
                                )}
                                {!safeImageUrl && !safeVideoUrl && !safeLocationUrl && !message.quickOfferPrice && message.text}

                                {msgContextMenu === message.id && (
                                    <div className="mt-1 flex gap-2">
                                        {isOwn && (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    unsendMessage(message.id);
                                                    setMsgContextMenu(null);
                                                }}
                                                className="text-xs text-amber-600 hover:underline"
                                            >
                                                Thu hoi
                                            </button>
                                        )}
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                deleteMessageForMe(message.id);
                                                setMsgContextMenu(null);
                                            }}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Xoa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {typingUserIds?.length > 0 && (
                    <div className="flex justify-start">
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs italic text-gray-500">
                            Dang go...
                        </span>
                    </div>
                )}

                <div id="scroll-to-bottom" />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 bg-white p-3">
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
                    placeholder="Nhap tin nhan..."
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
