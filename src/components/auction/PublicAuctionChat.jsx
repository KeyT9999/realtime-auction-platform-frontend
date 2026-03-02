import React, { useEffect, useMemo, useRef, useState } from 'react';
import { signalRService } from '../../services/signalRService';

const formatCurrency = (value) => {
  try {
    return Number(value).toLocaleString('vi-VN') + ' ₫';
  } catch {
    return '—';
  }
};

const getBidInfo = (data) => {
  const rawBid = data?.Bid ?? data?.bid;
  if (!rawBid) return null;
  return {
    userId: rawBid.userId ?? rawBid.UserId,
    userName: rawBid.userName ?? rawBid.UserName ?? 'Người dùng',
    amount: rawBid.amount ?? rawBid.Amount,
  };
};

const PublicAuctionChat = ({ auctionId, viewerCount, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);

  const emojis = useMemo(() => ['👍', '🔥', '😂', '😮', '👏', '❤️', '😎', '🎉'], []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!auctionId) return;

    const offChat = signalRService.on('AuctionChatMessage', (payload) => {
      const aId = payload?.AuctionId ?? payload?.auctionId;
      if (aId?.toString() !== auctionId.toString()) return;

      const userId = payload?.UserId ?? payload?.userId;
      const userName = payload?.UserName ?? payload?.userName ?? 'Người dùng';
      const msgText = payload?.Text ?? payload?.text ?? '';
      const sentAt = payload?.SentAt ?? payload?.sentAt ?? new Date().toISOString();

      if (!msgText) return;

      setMessages((prev) => [
        ...prev,
        {
          id: payload?.Id ?? payload?.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'user',
          userId: userId?.toString?.() ?? '',
          userName,
          text: msgText,
          ts: sentAt,
        },
      ]);
    });

    const offBid = signalRService.on('UpdateBid', (data) => {
      const info = getBidInfo(data);
      if (!info?.amount) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-bid-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'system',
          text: `${info.userName} vừa đặt giá ${formatCurrency(info.amount)}`,
          ts: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      offChat?.();
      offBid?.();
    };
  }, [auctionId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const optimisticId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        type: 'user',
        userId: currentUser?.id?.toString?.() ?? '',
        userName: currentUser?.fullName || currentUser?.name || 'Bạn',
        text: trimmed,
        ts: new Date().toISOString(),
        optimistic: true,
      },
    ]);
    setText('');
    setShowEmoji(false);

    try {
      await signalRService.invoke('SendAuctionChatMessage', auctionId, trimmed);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-err-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'system',
          text: 'Không gửi được tin nhắn realtime. Vui lòng thử lại.',
          ts: new Date().toISOString(),
          tone: 'error',
        },
      ]);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/60 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900">Public Auction Chat</div>
          <div className="text-xs text-gray-600">
            {viewerCount != null ? `${viewerCount} người đang online` : '—'}
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          Realtime
        </div>
      </div>

      <div className="h-72 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Chưa có tin nhắn nào. Hãy bắt đầu tương tác.
          </div>
        ) : (
          messages.map((m) => {
            const isSystem = m.type === 'system';
            const isOwn = !isSystem && m.userId && currentUser?.id?.toString?.() === m.userId.toString();

            if (isSystem) {
              return (
                <div
                  key={m.id}
                  className={`px-3 py-2 rounded-xl text-sm border ${
                    m.tone === 'error'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-amber-700 border-blue-100'
                  }`}
                >
                  {m.text}
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-blue-100 rounded-bl-sm'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-[11px] font-semibold text-gray-600 mb-0.5 truncate">
                      {m.userName}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-blue-100 bg-white/50 px-3 py-3">
        {showEmoji && (
          <div className="mb-2 flex flex-wrap gap-2">
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setText((t) => (t ? `${t} ${em}` : em))}
                className="px-2 py-1 rounded-lg bg-white border border-blue-100 hover:bg-blue-50 text-lg"
                aria-label={`emoji ${em}`}
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className="p-2 rounded-xl border border-blue-100 bg-white hover:bg-blue-50 text-gray-700"
            title="Emoji"
          >
            😊
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Gửi tin nhắn công khai..."
            className="flex-1 px-4 py-2 rounded-xl border border-blue-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Gửi
          </button>
        </form>
        <div className="mt-2 text-[11px] text-gray-500">
          Tin nhắn này là công khai cho tất cả người đang xem phiên đấu giá.
        </div>
      </div>
    </div>
  );
};

export default PublicAuctionChat;

