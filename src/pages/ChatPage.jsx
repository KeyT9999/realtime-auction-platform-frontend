import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import { imageUploadService } from '../services/imageUploadService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const ChatPage = () => {
    const {
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        sendMessage,
        currentUser
    } = useChat();

    const [productsMap, setProductsMap] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [view, setView] = useState('all'); // 'all', 'unread', 'spam'

    // Fetch product details for ALL conversations
    useEffect(() => {
        const fetchProducts = async () => {
            const newProductsMap = { ...productsMap };
            let hasChanges = false;

            for (const conv of conversations) {
                if (conv.auctionId && !newProductsMap[conv.auctionId]) {
                    try {
                        const response = await auctionService.getAuctionById(conv.auctionId);
                        newProductsMap[conv.auctionId] = response.data;
                        hasChanges = true;
                    } catch (err) {
                        console.error(`Failed to load auction ${conv.auctionId}`, err);
                    }
                }
            }

            if (hasChanges) {
                setProductsMap(newProductsMap);
            }
        };

        if (conversations.length > 0) {
            fetchProducts();
        }
    }, [conversations]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await sendMessage(newMessage);
        setNewMessage('');
    };

    const fileInputRef = React.useRef(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await imageUploadService.uploadImage(file);
            console.log('Upload response:', response);

            // Fix: apiService returns data directly, so response is { url: '...' }
            const imageUrl = response.url || response.data?.url || (typeof response === 'string' ? response : null);

            if (imageUrl) {
                await sendMessage(null, imageUrl);
            } else {
                console.error('Invalid image response structure:', response);
                toast.error('Không nhận được link ảnh từ server');
            }
        } catch (error) {
            console.error('Lỗi upload ảnh:', error);
            toast.error('Gửi ảnh thất bại');
        } finally {
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getOtherParticipant = (conv) => {
        const other = conv?.participants?.find(p => p.id.toString() !== currentUser?.id.toString()) || { firstName: 'User', lastName: '' };

        // If we have product details and this user is the seller, use the sellerName from product
        // This fixes the issue where previously created chats used "Người Bán"
        if (conv.auctionId) {
            const product = productsMap[conv.auctionId];
            if (product && product.sellerId.toString() === other.id.toString() && product.sellerName) {
                // If the stored name is generic or we just want to ensure accuracy
                return { ...other, firstName: product.sellerName, lastName: '' };
                // Note: We are putting full name in firstName for simplicity in display
            }
        }
        return other;
    };

    const activeProduct = activeConversation?.auctionId ? productsMap[activeConversation.auctionId] : null;

    const quickReplies = [
        "Sản phẩm này còn không?",
        "Bạn có ship hàng không?",
        "Sản phẩm này có còn bảo hành không?",
        "Sản phẩm này đã qua sửa chữa chưa?",
        "Có phụ kiện đi kèm theo sản phẩm?",
        "Sản phẩm có lỗi gì không?",
        "Đáy" // Matches screenshot
    ];

    const sendQuickReply = (text) => {
        sendMessage(text);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden font-sans">
            {/* Left Sidebar: Conversations List */}
            <div className="w-1/4 min-w-[300px] bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Chat</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nhập 3 ký tự để bắt đầu tìm kiếm"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <button className="absolute right-3 top-2.5 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 py-2 gap-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
                    <button className="px-3 py-1 bg-black text-white text-sm rounded-full whitespace-nowrap">Tất cả</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">Chưa đọc</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">Tin rác / Bỏ qua</button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>Chưa có cuộc trò chuyện nào.</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = getOtherParticipant(conv);
                            const isActive = activeConversation?.id === conv.id;
                            const product = productsMap[conv.auctionId];

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 group ${isActive ? 'bg-yellow-50' : ''}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                            <span className="font-bold text-gray-500 text-lg">{other.firstName?.charAt(0)}</span>
                                        </div>
                                        {/* Online indicator could go here */}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{other.firstName} {other.lastName}</h3>
                                            <span className="text-xs text-gray-400 shrink-0 ml-1">
                                                {conv.lastMessageTimestamp
                                                    ? formatDistanceToNow(conv.lastMessageTimestamp.toDate ? conv.lastMessageTimestamp.toDate() : new Date(), { addSuffix: true, locale: vi })
                                                    : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                            {product ? (
                                                <span className="font-medium text-gray-700">{product.title}</span>
                                            ) : (
                                                conv.lastMessage || 'Bắt đầu chat'
                                            )}
                                        </p>
                                        {product && (
                                            <p className="text-xs text-gray-400 truncate">
                                                {conv.lastMessage || '...'}
                                            </p>
                                        )}
                                    </div>

                                    {product && product.images?.[0] && (
                                        <div className="w-12 h-12 rounded overflow-hidden shrink-0 ml-1">
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white relative">
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <img src="https://static.chotot.com/storage/chat/chat-empty.png" alt="Empty Chat" className="w-48 opacity-50 mb-4" /> {/* Fallback or use SVG */}
                        <p className="text-lg">Chọn hội thoại để bắt đầu chat</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Header */}
                        <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {getOtherParticipant(activeConversation).firstName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">
                                        {getOtherParticipant(activeConversation).firstName} {getOtherParticipant(activeConversation).lastName}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span>Hoạt động 7 giờ trước</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <button className="p-2 hover:bg-gray-50 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* 2. Product Context Bar (Sticky) */}
                        {activeProduct && (
                            <div className="bg-gray-50 p-3 flex items-center gap-4 border-b border-gray-100 shrink-0">
                                <div className="w-12 h-12 bg-white rounded border border-gray-200 p-0.5 shrink-0">
                                    <img
                                        src={activeProduct.images?.[0]}
                                        alt={activeProduct.title}
                                        className="w-full h-full object-cover rounded-sm"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{activeProduct.title}</h4>
                                    <p className="text-red-500 font-bold text-sm">
                                        {activeProduct.currentPrice?.toLocaleString('vi-VN')} đ
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 3. Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 bg-white">
                            {/* Date seperator example */}
                            <div className="flex justify-center mb-6">
                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Thứ 3, 03/02/2026</span>
                            </div>

                            {/* Product Context Bubble (First message style) */}
                            {activeProduct && (
                                <div className="flex justify-end mb-4">
                                    <div className="bg-[#FFF9E5] p-4 rounded-xl max-w-[85%] cursor-pointer hover:bg-yellow-50 transition-colors shadow-sm">
                                        <div className="flex gap-3">
                                            <div className="w-1 self-stretch bg-[#FFB700] rounded-full shrink-0 my-1"></div>
                                            <div className="w-16 h-16 bg-white rounded-md shrink-0 border border-gray-100 overflow-hidden">
                                                <img src={activeProduct.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-2">{activeProduct.title}</p>
                                                <p className="text-sm text-[#FFB700] font-bold mt-1">{activeProduct.currentPrice?.toLocaleString('vi-VN')} đ</p>
                                                <p className="text-xs text-gray-500 mt-1">Dạ cho em hỏi tình trạng máy chi tiết ạ</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isOwn = msg.senderId === currentUser.id.toString();
                                const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                                return (
                                    <div key={msg.id} className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                            {!isOwn && (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mb-1">
                                                    {showAvatar ? <span className="text-xs font-bold text-gray-500">{getOtherParticipant(activeConversation).firstName?.charAt(0)}</span> : null}
                                                </div>
                                            )}

                                            <div
                                                className={`px-4 py-2 text-sm rounded-2xl ${isOwn
                                                    ? 'bg-yellow-100 text-gray-900 rounded-br-sm'
                                                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                                    }`}
                                            >
                                                {msg.image ? (
                                                    <img
                                                        src={msg.image}
                                                        alt="Sent image"
                                                        className="max-w-[200px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.image, '_blank')}
                                                    />
                                                ) : (
                                                    msg.text
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 self-end mb-1">
                                                {msg.timestamp ? (
                                                    new Date(msg.timestamp.toDate ? msg.timestamp.toDate() : msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                ) : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 4. Quick Replies & Input */}
                        <div className="shrink-0 border-t border-gray-100 bg-white">
                            {/* Quick Chips Carousel */}
                            <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar border-b border-gray-50">
                                {quickReplies.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendQuickReply(reply)}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap transition-colors border border-gray-200"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>

                            {/* Input Field */}
                            <div className="p-3">
                                <Link to={`/auction/${activeConversation.auctionId}`} className="text-xs text-blue-600 mb-2 block hover:underline">
                                    {/* Optional: Breadcrumb or helper link if needed */}
                                </Link>
                                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleImageClick}
                                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </button>
                                    <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </button>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Nhập tin nhắn"
                                            className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:bg-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </button>
                                    </div>

                                    {newMessage.trim() ? (
                                        <button
                                            type="submit"
                                            className="p-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-full text-white shadow-sm transition-transform transform active:scale-95"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="p-2.5 bg-gray-100 text-gray-400 rounded-full cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
