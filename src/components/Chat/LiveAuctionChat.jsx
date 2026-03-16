import React, { useState, useRef, useEffect } from 'react';
import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const EMOJIS = ['❤️', '👍', '😂', '🔥', '👀', '🎉'];

const STORAGE_VERSION = 1;
const STORAGE_KEY_PREFIX = 'fbid:auctionChat:v1:';
const MAX_STORED_MESSAGES = 200;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  const saveTimerRef = useRef(null);

  const storageKey = auctionId ? `${STORAGE_KEY_PREFIX}${auctionId}` : null;

  const normalizeTsToIso = (ts) => {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date();
    const ms = d instanceof Date ? d.getTime() : Date.now();
    return new Date(Number.isFinite(ms) ? ms : Date.now()).toISOString();
  };

  const pruneAndCap = (items) => {
    const now = Date.now();
    const unique = new Map();
    for (const it of items || []) {
      if (!it?.id) continue;
      if (unique.has(it.id)) continue;
      const iso = it.sentAt || it.timestamp;
      const t = new Date(iso || Date.now()).getTime();
      if (!Number.isFinite(t)) continue;
      if (now - t > TTL_MS) continue;
      unique.set(it.id, {
        ...it,
        sentAt: normalizeTsToIso(it.sentAt || it.timestamp),
      });
    }
    const arr = Array.from(unique.values()).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    return arr.slice(Math.max(0, arr.length - MAX_STORED_MESSAGES));
  };

  const splitHydrated = (items) => {
    const sys = [];
    const userMsgs = [];
    for (const it of items) {
      const kind = it.kind || it.type || (it.isSystem ? 'system' : 'user');
      if (kind === 'system') {
        sys.push({
          ...it,
          type: 'system',
          timestamp: it.sentAt,
        });
      } else {
        userMsgs.push({
          ...it,
          type: 'user',
          sentAt: it.sentAt,
        });
      }
    }
    return { sys, userMsgs };
  };

  const mergeForStorage = (sys, userMsgs) => {
    const combined = [
      ...(sys || []).map((m) => ({
        id: m.id,
        kind: 'system',
        text: m.text,
        sentAt: normalizeTsToIso(m.timestamp || m.sentAt),
        bidId: m.bidId,
      })),
      ...(userMsgs || []).map((m) => ({
        id: m.id,
        kind: 'user',
        text: m.text,
        userId: m.userId,
        userName: m.userName,
        sentAt: normalizeTsToIso(m.sentAt),
      })),
    ];
    return pruneAndCap(combined);
  };

  // Load persisted history when auctionId changes
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_VERSION || parsed.auctionId !== auctionId) return;
      const hydrated = pruneAndCap(parsed.messages || []);
      const { sys, userMsgs } = splitHydrated(hydrated);
      setSystemMessages(sys);
      setMessages(userMsgs);
    } catch {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

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
      return [...newOnes, ...prev].slice(0, MAX_STORED_MESSAGES);
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
      setMessages((prev) => [...prev, msg].slice(-MAX_STORED_MESSAGES));
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

  // Persist (throttled) when messages change
  useEffect(() => {
    if (!storageKey) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        const merged = mergeForStorage(systemMessages, messages);
        const payload = {
          version: STORAGE_VERSION,
          auctionId,
          savedAt: Date.now(),
          messages: merged,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // Ignore quota / serialization issues; chat still works realtime.
      }
    }, 400);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, auctionId, messages, systemMessages]);

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
    <div className="flex flex-col h-full min-h-[500px] bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gray-300/80 border-b border-gray-300 shrink-0">
        <h3 className="font-bold text-gray-800 text-[15px]">Live Chat</h3>
        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide font-medium">{auctionTitle}</p>
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
                className="flex justify-start px-2"
              >
                <div className="px-5 py-3 rounded-2xl bg-white shadow-sm text-sm text-gray-700 font-medium max-w-[90%] w-full">
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
                    className={`px-4 py-2 rounded-2xl ${msg.userId === user?.id?.toString()
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
      {user ? (
        <form onSubmit={handleSend} className="p-3 bg-gray-300/50 shrink-0 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2.5 bg-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm shadow-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            Gửi
          </button>
        </form>
      ) : (
        <div className="p-3 text-center text-sm text-gray-500 bg-gray-50/80">
          Đăng nhập để tham gia chat
        </div>
      )}
    </div>
  );
};

export default LiveAuctionChat;
