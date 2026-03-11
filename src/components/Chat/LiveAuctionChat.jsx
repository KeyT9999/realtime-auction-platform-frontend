import React, { useState, useRef, useEffect } from 'react';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const EMOJIS = ['❤️', '👍', '😂', '🔥', '👀', '🎉'];

const LiveAuctionChat = ({ auctionId, auctionTitle, isSeller, bids = [] }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [reactions, setReactions] = useState({}); // { msgId: { '❤️': [userId1], '👍': [userId2] } }
  const listRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  // Convert bids to system messages when bids change
  useEffect(() => {
    if (!bids || bids.length === 0) return;
    const latest = bids.slice(0, 10).map((b) => ({
      id: `bid-${b.id}`,
      type: 'system',
      text: `${b.userName || 'Người dùng'} vừa đặt mức giá ${Number(b.amount || 0).toLocaleString('vi-VN')}đ`,
      timestamp: b.timestamp || b.createdAt || new Date(),
      bidId: b.id,
    }));
    setSystemMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = latest.filter((m) => !existingIds.has(m.id));
      return [...newOnes, ...prev].slice(0, 50);
    });
  }, [bids]);

  // Listen to AuctionChatMessage
  useEffect(() => {
    if (!auctionId) return;
    const handler = (data) => {
      const aid = data?.auctionId ?? data?.AuctionId;
      if (aid && aid !== auctionId) return;
      const msg = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'user',
        userId: data?.userId ?? data?.UserId ?? 'guest',
        userName: data?.userName ?? data?.UserName ?? 'Ẩn danh',
        text: data?.text ?? data?.Text ?? '',
        sentAt: data?.sentAt ?? data?.SentAt ?? new Date(),
      };
      setMessages((prev) => [...prev, msg].slice(-100));
    };
    signalRService.on('AuctionChatMessage', handler);
    return () => signalRService.off('AuctionChatMessage', handler);
  }, [auctionId]);

  // System messages also come from UpdateBid in realtime (parent updates bids, effect above handles it)

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (!shouldAutoScrollRef.current) return;
    // Scroll ONLY inside the chat list container (avoid scrolling the whole page).
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, systemMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage?.trim();
    if (!text || !user) return;
    try {
      // Keep chat pinned to bottom after sending.
      shouldAutoScrollRef.current = true;
      await signalRService.invoke('SendAuctionChatMessage', auctionId, text);
      setNewMessage('');
    } catch (err) {
      console.error('Send chat error:', err);
    }
  };

  const handlePin = (msg) => {
    if (!isSeller) return;
    setPinnedMessage(msg);
  };

  const handleReaction = (msgId, emoji) => {
    if (!user) return;
    setReactions((prev) => {
      const curr = prev[msgId] || {};
      const list = curr[emoji] || [];
      const idx = list.indexOf(user.id.toString());
      const nextList = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, user.id.toString()];
      const nextEmoji = nextList.length ? { ...curr, [emoji]: nextList } : { ...curr };
      delete nextEmoji[emoji];
      if (Object.keys(nextEmoji).length === 0) {
        const next = { ...prev };
        delete next[msgId];
        return next;
      }
      return { ...prev, [msgId]: { ...curr, [emoji]: nextList } };
    });
    setShowEmojiPicker(null);
  };

  const renderTimestamp = (ts) => {
    const date = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date();
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  };

  const allMessages = [
    ...systemMessages.map((m) => ({ ...m, isSystem: true })),
    ...messages.map((m) => ({ ...m, isSystem: false })),
  ].sort((a, b) => {
    const ta = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.sentAt || a.timestamp);
    const tb = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.sentAt || b.timestamp);
    return ta - tb;
  });

  return (
    <div className="flex flex-col h-[420px] bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200/60 bg-white/40">
        <h3 className="font-bold text-gray-800">Live Chat</h3>
        <p className="text-xs text-gray-500">{auctionTitle}</p>
      </div>

      {/* Pinned message */}
      {pinnedMessage && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-amber-100/80 backdrop-blur border border-amber-200/60 text-sm">
          <span className="text-amber-700 font-medium">📌 Ghim: </span>
          <span className="text-gray-700">{pinnedMessage.text}</span>
          {isSeller && (
            <button
              onClick={() => setPinnedMessage(null)}
              className="ml-2 text-amber-600 hover:text-amber-800 text-xs"
            >
              Bỏ ghim
            </button>
          )}
        </div>
      )}

      {/* Messages - Glassmorphism style */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={() => {
          const el = listRef.current;
          if (!el) return;
          // Only auto-scroll when user is already near the bottom.
          const thresholdPx = 120;
          const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
          shouldAutoScrollRef.current = distanceFromBottom <= thresholdPx;
        }}
      >
        {allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <p>Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
          </div>
        ) : (
          allMessages.map((msg) =>
            msg.isSystem ? (
              <div
                key={msg.id}
                className="flex justify-center"
              >
                <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 shadow-sm text-sm text-gray-600 max-w-[90%]">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className={`flex ${msg.userId === user?.id?.toString() ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="relative max-w-[75%]">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.userId === user?.id?.toString()
                        ? 'bg-amber-100/90 text-gray-900 rounded-br-sm'
                        : 'bg-white/80 backdrop-blur border border-gray-200/60 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.userId !== user?.id?.toString() && (
                      <p className="text-xs font-medium text-amber-700 mb-0.5">{msg.userName}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {/* Reactions */}
                    {reactions[msg.id] &&
                      Object.entries(reactions[msg.id]).map(([emoji, ids]) =>
                        ids.length > 0 ? (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="text-sm px-1.5 py-0.5 rounded-full bg-gray-100/80 hover:bg-gray-200/80"
                          >
                            {emoji} {ids.length > 1 ? ids.length : ''}
                          </button>
                        ) : null
                      )}
                    {/* Reaction button */}
                    <div className="relative inline-block">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100/80 text-gray-500 text-sm transition-opacity"
                      >
                        🙂
                      </button>
                      {showEmojiPicker === msg.id && (
                        <div className="absolute bottom-full left-0 mb-1 flex gap-1 p-2 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 z-10">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => handleReaction(msg.id, e)}
                              className="hover:scale-125 transition-transform"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Pin (seller only) */}
                    {isSeller && (
                      <button
                        onClick={() => handlePin(msg)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100/80 text-gray-500 text-xs transition-opacity"
                        title="Ghim tin nhắn"
                      >
                        📌
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {renderTimestamp(msg.sentAt || msg.timestamp)}
                  </span>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Input */}
      {user && (
        <form onSubmit={handleSend} className="p-3 border-t border-gray-200/60 bg-white/40 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2.5 bg-white/80 backdrop-blur border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors"
          >
            Gửi
          </button>
        </form>
      )}
      {!user && (
        <div className="p-3 text-center text-sm text-gray-500 bg-gray-50/80">
          Đăng nhập để tham gia chat
        </div>
      )}
    </div>
  );
};

export default LiveAuctionChat;
