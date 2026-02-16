import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const MarketplaceChat = ({ product, onClose }) => {
    const {
        currentUser,
        activeConversation,
        messages,
        sendMessage,
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [mockMessages, setMockMessages] = useState([]);

    // Mock product data if not provided
    const productData = product || {
        id: '1',
        title: 'Xe máy Honda Wave RSX 2020',
        price: '15.000.000',
        thumbnail: 'https://via.placeholder.com/60x60/FFC107/FFFFFF?text=🚲',
        seller: {
            id: '2',
            firstName: 'Nguyễn',
            lastName: 'Văn A'
        }
    };

    // Quick reply options
    const quickReplies = [
        'Còn hàng không?',
        'Giá có thể thương lượng không?',
        'Có thể xem hàng ở đâu?',
        'Tình trạng sản phẩm như thế nào?',
        'Có ship không?'
    ];

    // Initialize with mock messages for demo if no active conversation
    useEffect(() => {
        if (!activeConversation && messages.length === 0) {
            const mock = [
                {
                    id: '1',
                    senderId: productData.seller.id.toString(),
                    text: 'Xin chào! Bạn quan tâm đến sản phẩm này không?',
                    timestamp: { toDate: () => new Date(Date.now() - 3600000) }
                },
                {
                    id: '2',
                    senderId: currentUser?.id?.toString() || '1',
                    text: 'Chào bạn! Xe còn hàng không ạ?',
                    timestamp: { toDate: () => new Date(Date.now() - 3300000) }
                },
                {
                    id: '3',
                    senderId: productData.seller.id.toString(),
                    text: 'Còn hàng bạn nhé! Xe đẹp lắm, bạn có muốn xem thêm hình không?',
                    timestamp: { toDate: () => new Date(Date.now() - 3000000) }
                },
                {
                    id: '4',
                    senderId: productData.seller.id.toString(),
                    imageUrl: 'https://images.unsplash.com/photo-1558980664-1db506751c6c?w=400&h=300&fit=crop',
                    text: 'Đây là hình chi tiết của xe',
                    timestamp: { toDate: () => new Date(Date.now() - 2700000) }
                },
                {
                    id: '5',
                    senderId: currentUser?.id?.toString() || '1',
                    text: 'Xe đẹp quá! Giá có thể thương lượng không ạ?',
                    timestamp: { toDate: () => new Date(Date.now() - 2400000) }
                }
            ];
            setMockMessages(mock);
        } else {
            setMockMessages([]);
        }
    }, [activeConversation, messages.length, currentUser, productData]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, mockMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;

        // In a real implementation, you'd upload the image first
        if (selectedImage) {
            // TODO: Upload image to storage and get URL
            // For now, we'll just send the text message
            console.log('Image selected:', selectedImage);
        }

        if (newMessage.trim()) {
            await sendMessage(newMessage);
            setNewMessage('');
        }

        // Reset image selection
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleQuickReply = (reply) => {
        setNewMessage(reply);
    };

    const handleImageSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleGalleryClick = () => {
        imageInputRef.current?.click();
    };

    const getOtherParticipant = () => {
        if (!activeConversation) return productData.seller;
        return activeConversation?.participants?.find(
            p => p.id.toString() !== currentUser?.id.toString()
        ) || productData.seller;
    };

    const other = getOtherParticipant();
    const isSeller = currentUser?.id.toString() === productData.seller?.id?.toString();

    return (
        <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl">
            {/* Top Header - Sticky Product Context */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 p-3">
                    {/* Product Thumbnail */}
                    <div className="flex-shrink-0">
                        <img
                            src={productData.thumbnail}
                            alt={productData.title}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                            {productData.title}
                        </h3>
                        <p className="text-red-600 font-semibold text-sm">
                            {productData.price} đ
                        </p>
                    </div>

                    {/* Make Offer Button */}
                    <button
                        className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-colors duration-200"
                        onClick={() => {
                            // Handle make offer action
                            console.log('Make offer clicked');
                        }}
                    >
                        Đặt giá
                    </button>

                    {/* Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Middle - Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-4">
                {(messages.length === 0 && mockMessages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                    </div>
                ) : (
                    [...(messages.length > 0 ? messages : mockMessages)].map((msg) => {
                        const isOwn = msg.senderId === currentUser?.id?.toString();
                        const isBuyer = !isSeller;
                        const messageIsFromBuyer = !isOwn && isSeller;

                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {/* Message Bubble */}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl ${
                                            isOwn
                                                ? 'bg-yellow-500 text-gray-900 rounded-br-sm shadow-sm'
                                                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200'
                                        }`}
                                    >
                                        {/* Image Attachment */}
                                        {msg.imageUrl && (
                                            <div className="mb-2 rounded-lg overflow-hidden max-w-xs">
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Attachment"
                                                    className="max-w-full h-auto rounded-lg"
                                                />
                                            </div>
                                        )}

                                        {/* Text Message */}
                                        {msg.text && (
                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                                isOwn ? 'text-gray-900' : 'text-gray-800'
                                            }`}>
                                                {msg.text}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    {msg.timestamp && (
                                        <span className="text-xs text-gray-500 mt-1 px-2">
                                            {msg.timestamp.toDate ? 
                                                formatDistanceToNow(msg.timestamp.toDate(), {
                                                    addSuffix: true,
                                                    locale: vi
                                                }) : 
                                                'Vừa xong'
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Image Preview */}
                {imagePreview && (
                    <div className="flex justify-end">
                        <div className="max-w-[75%] rounded-2xl overflow-hidden shadow-sm">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-w-full h-auto"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom - Input Area */}
            <div className="bg-white border-t border-gray-200">
                {/* Quick Reply Chips */}
                {newMessage === '' && (
                    <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full font-medium transition-colors duration-200"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSend} className="p-3 flex items-end gap-2">
                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="w-full px-4 py-2.5 pr-12 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Camera Icon */}
                    <button
                        type="button"
                        onClick={handleCameraClick}
                        className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Hidden Camera Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageSelect(e, 'camera')}
                        className="hidden"
                    />

                    {/* Gallery Icon */}
                    <button
                        type="button"
                        onClick={handleGalleryClick}
                        className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Hidden Gallery Input */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, 'gallery')}
                        className="hidden"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className={`p-2.5 rounded-full transition-all duration-200 ${
                            newMessage.trim() || selectedImage
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MarketplaceChat;

