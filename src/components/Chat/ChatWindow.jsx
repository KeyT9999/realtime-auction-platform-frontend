import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { auctionService } from '../../services/auctionService';

const ChatWindow = () => {
    const {
        currentUser,
        activeConversation,
        messages,
        sendMessage,
        conversations,
        setActiveConversation,
        closeChat
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [view, setView] = useState('list'); // 'list' or 'chat'

    // Product details state for widget
    const [activeProduct, setActiveProduct] = useState(null);

    // If we have an active conversation, default to chat view
    React.useEffect(() => {
        if (activeConversation) {
            setView('chat');

            // Fetch product info if available
            if (activeConversation.auctionId) {
                auctionService.getAuctionById(activeConversation.auctionId)
                    .then(res => setActiveProduct(res.data))
                    .catch(err => console.error(err));
            } else {
                setActiveProduct(null);
            }
        }
    }, [activeConversation]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(newMessage);
        setNewMessage('');
    };

    const getOtherParticipant = (conv) => {
        return conv?.participants?.find(p => p.id.toString() !== currentUser?.id.toString()) || { firstName: 'User', lastName: '' };
    };

    const handleBack = () => {
        setActiveConversation(null);
        setView('list');
    };

    if (view === 'list') {
        return (
            <div className="flex flex-col h-full bg-white rounded-t-lg shadow-xl overflow-hidden w-80 sm:w-96 border border-gray-200">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center rounded-t-lg">
                    <h3 className="font-bold">Tin nhắn</h3>
                    <button onClick={closeChat} className="hover:bg-blue-700 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 mt-10">
                            <p>Chưa có cuộc trò chuyện nào.</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = getOtherParticipant(conv);
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => { setActiveConversation(conv); setView('chat'); }}
                                    className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                        {other.firstName?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-800 truncate">{other.firstName} {other.lastName}</p>
                                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}</p>
                                    </div>
                                    {conv.lastMessageTimestamp && (
                                        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                                            {/* Basic time formatting or date-fns */}
                                            {/* We need to handle Firestore Timestamp to Date conversion if needed */}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-2 border-t text-center bg-gray-50">
                    <Link to="/chat" onClick={closeChat} className="text-sm text-blue-600 hover:text-blue-800 font-semibold block w-full py-1">
                        Xem tất cả tin nhắn
                    </Link>
                </div>
            </div >
        );
    }

    // Chat View
    const other = getOtherParticipant(activeConversation);

    return (
        <div className="flex flex-col h-full bg-white rounded-t-lg shadow-xl overflow-hidden w-80 sm:w-96 border border-gray-200">
            <div className="bg-blue-600 p-3 text-white flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} className="hover:bg-blue-700 p-1 rounded mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                        {other.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{other.firstName} {other.lastName}</h3>
                        {/* <span className="text-xs text-blue-200">Online</span> */}
                    </div>
                </div>
                <button onClick={closeChat} className="hover:bg-blue-700 p-1 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Product Context Mini Bar */}
            {activeProduct && (
                <div className="bg-yellow-50 px-3 py-2 border-b border-yellow-100 flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded border border-gray-200 shrink-0">
                        <img src={activeProduct.images?.[0]} alt="" className="w-full h-full object-cover rounded-sm" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-gray-800">{activeProduct.title}</p>
                        <p className="text-xs font-bold text-red-600">{activeProduct.currentPrice?.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 flex flex-col">
                {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUser.id.toString();
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`px-4 py-2 text-sm max-w-[80%] rounded-2xl ${isOwn
                                        ? 'bg-yellow-100 text-gray-900 rounded-br-sm'
                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                                    }`}
                            >
                                {msg.image ? (
                                    <img
                                        src={msg.image}
                                        alt="Sent image"
                                        className="max-w-full max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(msg.image, '_blank')}
                                    />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* Helper div to scroll to bottom */}
                <div id="scroll-to-bottom" />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
