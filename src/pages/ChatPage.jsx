// Mục đích tệp: Trien khai logic/chuc nang chinh cua file ChatPage.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { auctionService } from '../services/auctionService';
import { imageUploadService } from '../services/imageUploadService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { vi } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { openSafeUrl, sanitizeExternalUrl } from '../utils/urlSecurity';

/* ─── SVG Icons ─── */
const Ic = ({ d, size = 20, fill = 'none', strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  attach: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
  img: ['M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z', 'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M21 15l-5-5L5 21'],
  mic: ['M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z', 'M19 10v2a7 7 0 01-14 0v-2', 'M12 19v4M8 23h8'],
  more: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  gavel: 'M15 5L19 9M5.68 19.32a2.4 2.4 0 003.39 0l9.26-9.26a2.4 2.4 0 000-3.39L16.34 4.68a2.4 2.4 0 00-3.39 0L3.68 13.93a2.4 2.4 0 000 3.39l2 2z',
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  trend: 'M23 6l-9.5 9.5-5-5L1 18',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  user: ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  info: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 16v-4M12 8h.01'],
  block: ['M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'],
  check: ['M20 6L9 17l-5-5'],
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
  trash: ['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2'],
  loc: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 13a3 3 0 100-6 3 3 0 000 6z'],
  video: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
  receipt: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'],
  verified: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  plus: 'M12 4v16m8-8H4',
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatRelTime = (ts) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
};

const Avatar = ({ name = '', size = 10, src = null, online = false }) => {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-500'];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`relative shrink-0 w-${size} h-${size}`}>
      <div className={`w-full h-full rounded-full ${src ? '' : color} flex items-center justify-center overflow-hidden`}>
        {src
          ? <img src={src} alt={name} className="w-full h-full object-cover" />
          : <span className="text-white font-bold text-sm select-none">{name?.charAt(0)?.toUpperCase()}</span>
        }
      </div>
      {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
    </div>
  );
};

/* ─── Countdown for auction ─── */
const Countdown = ({ endDate }) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = new Date(endDate) - Date.now();
      if (diff <= 0) { setDisplay('Đã kết thúc'); return; }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setDisplay(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span className={display === 'Đã kết thúc' ? 'text-slate-400 text-xs font-bold' : 'text-red-500 text-xs font-bold tabular-nums'}>{display || '--:--:--'}</span>;
};

/* ─── MAIN COMPONENT ─── */
const ChatPage = () => {
  const {
    conversations, activeConversation, setActiveConversation,
    messages, sendMessage, unsendMessage, deleteMessageForMe,
    deleteConversation, pinConversation, blockUser, reportConversation,
    currentUser, typingUserIds, setTyping,
    isConversationsLoading, hasLoadedConversations,
  } = useChat();

  const navigate = useNavigate();
  const [productsMap, setProductsMap] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showQuickOffer, setShowQuickOffer] = useState(false);
  const [quickOfferPrice, setQuickOfferPrice] = useState('');
  const [convCtxMenu, setConvCtxMenu] = useState(null);
  const [msgCtxMenu, setMsgCtxMenu] = useState(null);
  const [headerMenu, setHeaderMenu] = useState(false);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimer = useRef(null);

  /* Fetch auction products */
  useEffect(() => {
    const fetch = async () => {
      const map = { ...productsMap };
      let changed = false;
      for (const conv of conversations) {
        if (conv.auctionId && !map[conv.auctionId]) {
          try {
            const res = await auctionService.getAuctionById(conv.auctionId);
            map[conv.auctionId] = res;
            changed = true;
          } catch { }
        }
      }
      if (changed) setProductsMap(map);
    };
    if (conversations.length > 0) fetch();
  }, [conversations]);

  const scrollMessagesToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  /* Scroll only the message pane on new messages */
  useEffect(() => {
    if (!activeConversation) return;

    const frameId = window.requestAnimationFrame(() => {
      scrollMessagesToBottom(messages.length > 0 ? 'smooth' : 'auto');
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeConversation, messages, scrollMessagesToBottom]);

  /* Close menus on outside click */
  useEffect(() => {
    const h = () => { setConvCtxMenu(null); setMsgCtxMenu(null); setHeaderMenu(false); setShowAttachMenu(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const getOther = useCallback((conv) => {
    const other = conv?.participants?.find(p => p.id.toString() !== currentUser?.id?.toString()) || { firstName: '', lastName: '' };
    const baseName = `${(other.firstName || '').trim()} ${(other.lastName || '').trim()}`.trim() || 'Người bán';
    if (conv?.auctionId) {
      const prod = productsMap[conv.auctionId];
      if (prod && prod.sellerId?.toString() === other.id?.toString() && prod.sellerName)
        return { ...other, firstName: prod.sellerName, lastName: '' };
    }
    return { ...other, firstName: baseName, lastName: '' };
  }, [currentUser, productsMap]);

  const activeProduct = activeConversation?.auctionId ? productsMap[activeConversation.auctionId] : null;
  const otherUser = activeConversation ? getOther(activeConversation) : null;
  const isTyping = typingUserIds?.length > 0;

  const filteredConvs = conversations.filter(conv => {
    if (!search.trim()) return true;
    const other = getOther(conv);
    const name = `${other.firstName} ${other.lastName}`.toLowerCase();
    const prod = productsMap[conv.auctionId];
    return name.includes(search.toLowerCase()) || prod?.title?.toLowerCase().includes(search.toLowerCase());
  });

  const getTs = (conv) => {
    const t = conv.lastMessageTimestamp;
    if (!t) return 0;
    return t?.toDate ? t.toDate().getTime() : new Date(t).getTime();
  };

  const showConversationLoading = isConversationsLoading && !hasLoadedConversations && conversations.length === 0;
  const showSearchEmpty = hasLoadedConversations && conversations.length > 0 && filteredConvs.length === 0;
  const showConversationEmpty = hasLoadedConversations && conversations.length === 0;
  const showMainLoading = showConversationLoading
    || (hasLoadedConversations && conversations.length > 0 && !activeConversation);

  const renderConversationList = () => {
    if (showConversationLoading) {
      return (
        <div className="px-2 py-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-3.5 py-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3.5 bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (showConversationEmpty) {
      return (
        <div className="py-16 text-center text-slate-400">
          <Ic d={IC.gavel} size={32} />
          <p className="mt-2 text-sm">Chưa có cuộc trò chuyện</p>
        </div>
      );
    }

    if (showSearchEmpty) {
      return (
        <div className="py-16 text-center text-slate-400">
          <Ic d={IC.search} size={28} />
          <p className="mt-2 text-sm">Không tìm thấy cuộc trò chuyện phù hợp</p>
        </div>
      );
    }

    return filteredConvs.map((conv) => {
      const other = getOther(conv);
      const prod = productsMap[conv.auctionId];
      const isActive = activeConversation?.id === conv.id;
      const isPinned = !!conv.pinnedBy?.[currentUser?.id];
      const uid = currentUser?.id?.toString();
      const unread = conv.unreadCounts?.[uid] || 0;

      return (
        <div
          key={conv.id}
          onClick={() => { setActiveConversation(conv); setConvCtxMenu(null); }}
          onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setConvCtxMenu(conv.id); }}
          className={`relative flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all group
            ${isActive ? 'bg-slate-800 shadow-inner border border-slate-700' : 'hover:bg-slate-800/50 border border-transparent'}`}
        >
          {isPinned && <span className="absolute top-2 right-2 text-amber-400 opacity-60"><Ic d={IC.pin} size={10} /></span>}
          <Avatar name={`${other.firstName} ${other.lastName}`} size={11} online />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="font-semibold text-sm text-white truncate">{other.firstName} {other.lastName}</h3>
              <span className={`text-[10px] font-semibold uppercase tracking-wide shrink-0 ml-1 ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                {formatRelTime(conv.lastMessageTimestamp)?.replace(' trước', '')?.replace('khoảng ', '')}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate leading-relaxed">
              {prod?.title || conv.lastMessage || 'Bắt đầu chat'}
            </p>
            {conv.auctionId && (
              <p className="text-[10px] text-slate-500 truncate mt-1">
                Thread đấu giá: {conv.auctionId}
              </p>
            )}
          </div>
          {unread > 0 && (
            <span className="shrink-0 w-5 h-5 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}

          {convCtxMenu === conv.id && (
            <div
              className="absolute right-2 top-14 z-30 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 min-w-[160px]"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => { pinConversation(conv.id, !isPinned); setConvCtxMenu(null); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-200">
                <Ic d={IC.pin} size={14} />{isPinned ? 'Bỏ ghim' : 'Ghim'}
              </button>
              <button onClick={() => { if (window.confirm('Xóa hội thoại?')) deleteConversation(conv.id); setConvCtxMenu(null); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 text-red-400 flex items-center gap-2">
                <Ic d={IC.trash} size={14} />Xóa hội thoại
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage.trim());
    setNewMessage('');
    setTyping(false);
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextChange = (e) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 2000);
  };

  const handleFileChange = async (e, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await imageUploadService.uploadImage(file);
      const url = res.url || res.data?.url || (typeof res === 'string' ? res : null);
      if (url) {
        if (type === 'image') await sendMessage(null, url);
        else await sendMessage(null, null, { type: 'video', videoUrl: url });
      } else toast.error('Không nhận được URL từ server');
    } catch { toast.error(type === 'image' ? 'Gửi ảnh thất bại' : 'Gửi video thất bại'); }
    e.target.value = '';
  };

  const handleLocation = () => {
    setShowAttachMenu(false);
    if (!navigator.geolocation) return toast.error('Trình duyệt không hỗ trợ định vị');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        sendMessage(`📍 Vị trí của tôi: ${url}`, null, { type: 'location', location: { lat, lng, url } });
      },
      () => toast.error('Không thể lấy vị trí')
    );
  };

  const handleQuickOffer = () => {
    const price = parseInt(quickOfferPrice.replace(/\D/g, ''), 10);
    if (!price || price <= 0) return toast.error('Vui lòng nhập giá hợp lệ');
    sendMessage(`💰 Giá ưu đãi: ${price.toLocaleString('vi-VN')}đ`, null, { type: 'quick_offer', quickOfferPrice: price });
    setQuickOfferPrice(''); setShowQuickOffer(false); setShowAttachMenu(false);
  };

  const quickReplies = ['Sản phẩm còn không?', 'Có bảo hành không?', 'Ship toàn quốc không?', 'Có trầy xước không?', 'Phụ kiện đi kèm?'];

  /* ═══ RENDER ═══ */
  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-950 overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e, 'image')} className="hidden" accept="image/*" />
      <input type="file" ref={videoInputRef} onChange={e => handleFileChange(e, 'video')} className="hidden" accept="video/*" />

      {/* ── 1. Narrow Nav Sidebar ── */}
      <aside className="w-16 hidden md:flex flex-col items-center py-6 border-r border-slate-800 bg-slate-900 gap-6">
        <div className="text-blue-600 mb-2">
          <Ic d={IC.gavel} size={28} strokeWidth={2} />
        </div>
        <nav className="flex flex-col gap-5 flex-1">
          {[
            { icon: IC.grid, label: 'Trang chủ', to: '/home' },
            { icon: IC.trend, label: 'Đấu giá', to: '/auctions' },
            { icon: IC.heart, label: 'Watchlist', to: '/my-watchlist' },
          ].map(({ icon, label, to }) => (
            <Link key={to} to={to} title={label}
              className="text-slate-400 hover:text-amber-500 transition-colors p-2 rounded-xl hover:bg-slate-800">
              <Ic d={icon} size={20} />
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Avatar name={currentUser?.fullName || 'U'} size={8} />
        </div>
      </aside>

      {/* ── 2. Conversation List ── */}
      <section className="w-80 flex flex-col border-r border-slate-800 bg-slate-900">
        <div className="p-5 pb-3">
          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">Tin nhắn</h1>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Ic d={IC.search} size={16} />
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm cuộc trò chuyện"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4" style={{ scrollbarWidth: 'thin' }}>
          {renderConversationList()}
        </div>
      </section>

      {/* ── 3. Main Chat Area ── */}
      <main className="flex-1 flex flex-col bg-slate-950 relative min-w-0">
        {showMainLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-900/20 flex items-center justify-center text-blue-500 animate-pulse">
              <Ic d={IC.gavel} size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-300">Đang khôi phục lịch sử chat</p>
              <p className="text-sm mt-1">Hội thoại gần nhất sẽ được mở tự động</p>
            </div>
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Ic d={IC.gavel} size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-300">Chọn cuộc trò chuyện</p>
              <p className="text-sm mt-1">để bắt đầu nhắn tin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-18 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar name={`${otherUser?.firstName} ${otherUser?.lastName}`} size={10} online />
                <div>
                  <h2 className="font-bold text-base text-white leading-tight">
                    {otherUser?.firstName} {otherUser?.lastName}
                  </h2>
                  {activeProduct && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Về:</span>
                      <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wide truncate max-w-[200px]">
                        {activeProduct.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeProduct && (
                  <Link to={`/auctions/${activeConversation.auctionId}`}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors">
                    <Ic d={IC.eye} size={14} />Xem đấu giá
                  </Link>
                )}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setHeaderMenu(v => !v)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
                    <Ic d={IC.more} size={20} />
                  </button>
                  {headerMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 min-w-[160px] z-20">
                      <button
                        onClick={() => { reportConversation(activeConversation.id, 'Spam/lừa đảo'); setHeaderMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-orange-400">
                        <Ic d={IC.info} size={14} />Báo cáo
                      </button>
                      <button
                        onClick={() => { blockUser(getOther(activeConversation).id); setHeaderMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-red-400">
                        <Ic d={IC.block} size={14} />Chặn người dùng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Messages Feed */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Date separator */}
              <div className="flex justify-center">
                <span className="px-4 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>

              {/* Product context card */}
              {activeProduct && (
                <div className="max-w-sm mx-auto p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex gap-4">
                  {activeProduct.images?.[0] && (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                      <img src={activeProduct.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 py-0.5">
                    <h4 className="text-sm font-bold text-white truncate">{activeProduct.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Giá hiện tại:</span>
                      <span className="text-sm font-bold text-amber-500">
                        {activeProduct.currentPrice?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <Link to={`/auctions/${activeConversation.auctionId}`}
                        className="px-3 py-1.5 bg-amber-500 text-slate-900 rounded-lg text-[11px] font-bold hover:bg-amber-600 transition-colors">
                        Đặt giá
                      </Link>
                      <Link to={`/auctions/${activeConversation.auctionId}`}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold hover:bg-slate-700 transition-colors">
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUser?.id?.toString();
                const showAv = !isOwn && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                const time = formatTime(msg.timestamp);
                const safeImageUrl = sanitizeExternalUrl(msg.image);
                const safeVideoUrl = sanitizeExternalUrl(msg.video);
                const safeLocationUrl = sanitizeExternalUrl(msg.location?.url);

                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-[78%] ${isOwn ? 'ml-auto' : ''}`}>
                    {!isOwn && (
                      <div className="w-8 shrink-0">
                        {showAv && <Avatar name={`${otherUser?.firstName}`} size={8} />}
                      </div>
                    )}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-pointer select-text transition-all hover:opacity-95
                          ${isOwn
                            ? 'bg-amber-500 text-slate-900 rounded-br-none shadow-lg shadow-amber-900/20'
                            : 'bg-slate-800 text-white rounded-bl-none shadow-sm border border-slate-700'}`}
                        onClick={e => { e.stopPropagation(); setMsgCtxMenu(msgCtxMenu === msg.id ? null : msg.id); }}
                      >
                        {safeImageUrl && (
                          <img src={safeImageUrl} alt="Sent" className="max-w-[240px] rounded-xl cursor-pointer mb-1 shadow-md"
                            onClick={e => { e.stopPropagation(); openSafeUrl(safeImageUrl); }} />
                        )}
                        {safeVideoUrl && (
                          <a href={safeVideoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                            className={`flex items-center gap-1 ${isOwn ? 'text-slate-900' : 'text-amber-500'} hover:underline text-xs mb-1`}>
                            <Ic d={IC.video} size={14} />Xem video
                          </a>
                        )}
                        {safeLocationUrl && (
                          <a href={safeLocationUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                            className={`flex items-center gap-1 ${isOwn ? 'text-slate-900' : 'text-amber-500'} hover:underline text-xs mb-1`}>
                            <Ic d={IC.loc} size={14} />Xem vị trí
                          </a>
                        )}
                        {msg.quickOfferPrice && (
                          <div className={`font-bold py-0.5 ${isOwn ? 'text-amber-950' : 'text-amber-500'}`}>
                            💰 Giá ưu đãi: {Number(msg.quickOfferPrice).toLocaleString('vi-VN')}đ
                          </div>
                        )}
                        {msg.text && (
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        )}

                        {msgCtxMenu === msg.id && (
                          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-500/20" onClick={e => e.stopPropagation()}>
                            {isOwn && (
                              <button onClick={() => { unsendMessage(msg.id); setMsgCtxMenu(null); }}
                                className="text-[11px] underline opacity-80 hover:opacity-100">Thu hồi</button>
                            )}
                            <button onClick={() => { deleteMessageForMe(msg.id); setMsgCtxMenu(null); }}
                              className="text-[11px] underline opacity-80 hover:opacity-100 text-red-500">Xóa</button>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-slate-500">{time}</span>
                        {isOwn && <Ic d={IC.check} size={12} strokeWidth={2.5} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 opacity-70">
                  <div className="flex gap-1 px-3.5 py-2.5 bg-slate-800 rounded-2xl rounded-bl-none border border-slate-700 shadow-sm">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{otherUser?.firstName} đang nhập...</span>
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="flex gap-2 overflow-x-auto px-6 py-2 bg-slate-900/80 border-t border-slate-800" style={{ scrollbarWidth: 'none' }}>
              {quickReplies.map((r, i) => (
                <button key={i} onClick={() => sendMessage(r)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-500 rounded-full text-xs text-slate-300 whitespace-nowrap transition-colors border border-slate-700 shrink-0">
                  {r}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <footer className="px-6 py-4 bg-slate-900 border-t border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="flex items-end gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 focus-within:border-amber-500/50 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
                {/* Attach button */}
                <div className="relative pb-1.5 px-1">
                  <button type="button" onClick={() => setShowAttachMenu(v => !v)}
                    className="text-slate-500 hover:text-amber-500 transition-colors">
                    <Ic d={IC.attach} size={20} />
                  </button>
                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 min-w-[180px] z-20">
                      <button onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2.5 text-slate-200">
                        <Ic d={IC.img} size={15} />Gửi ảnh
                      </button>
                      <button onClick={() => { setShowAttachMenu(false); videoInputRef.current?.click(); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2.5 text-slate-200">
                        <Ic d={IC.video} size={15} />Gửi video
                      </button>
                      <button onClick={handleLocation}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2.5 text-slate-200">
                        <Ic d={IC.loc} size={15} />Chia sẻ vị trí
                      </button>
                      {activeProduct && activeProduct.sellerId?.toString() === currentUser?.id?.toString() && (
                        <button onClick={() => { setShowQuickOffer(true); setShowAttachMenu(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2.5 text-amber-500 font-bold">
                          💰 Giao dịch nhanh
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={newMessage}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-sm text-white resize-none placeholder-slate-500 outline-none max-h-32"
                  style={{ scrollbarWidth: 'none' }}
                />

                {/* Send button */}
                <div className="pb-1 pr-1">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all
                      ${newMessage.trim()
                        ? 'bg-amber-500 text-slate-900 hover:bg-amber-600 hover:scale-105 shadow-lg shadow-amber-900/20 active:scale-95'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                  >
                    <Ic d={IC.send} size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Quick offer input */}
              {showQuickOffer && (
                <div className="flex gap-2 mt-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <input type="text" value={quickOfferPrice} onChange={e => setQuickOfferPrice(e.target.value)}
                    placeholder="Nhập giá ưu đãi (VNĐ)"
                    className="flex-1 px-3 py-2 border border-slate-700 bg-slate-900 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button onClick={handleQuickOffer} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-sm font-bold transition-colors">Gửi</button>
                  <button onClick={() => { setShowQuickOffer(false); setQuickOfferPrice(''); }} className="px-2 text-slate-400 hover:text-slate-200">✕</button>
                </div>
              )}

              <div className="flex justify-between items-center mt-2 px-1">
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest transition-colors">
                    <Ic d={IC.img} size={14} />Photos
                  </button>
                  <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest transition-colors">
                    <Ic d={IC.mic} size={14} />Voice
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 italic">Mã hóa đầu cuối</span>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* ── 4. Auction Context Panel ── */}
      {activeConversation && (
        <aside className="hidden xl:flex w-72 flex-col bg-slate-900 border-l border-slate-800 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Thông tin đấu giá</h3>

            {activeProduct ? (
              <>
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/50 shadow-sm mb-5">
                  {activeProduct.images?.[0] && (
                    <img src={activeProduct.images[0]} alt="" className="w-full aspect-[4/3] object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-white mb-0.5">{activeProduct.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">{activeProduct.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-semibold text-slate-500">Thời gian còn</span>
                        <Countdown endDate={activeProduct.endDate} />
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-semibold text-slate-500">Giá hiện tại</span>
                        <span className="text-xs font-bold text-amber-500">{activeProduct.currentPrice?.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-semibold text-slate-500">Lượt đấu</span>
                        <span className="text-xs font-bold text-white">{activeProduct.totalBids ?? '–'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Thao tác nhanh</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/auctions/${activeConversation.auctionId}`}
                      className="flex flex-col items-center gap-1.5 p-3 bg-slate-950 rounded-2xl hover:border-amber-500/50 hover:text-amber-500 border border-slate-800 transition-colors group text-slate-300">
                      <Ic d={IC.verified} size={20} />
                      <span className="text-[10px] font-bold">Xem đấu giá</span>
                    </Link>
                    <Link to={`/auctions/${activeConversation.auctionId}`}
                      className="flex flex-col items-center gap-1.5 p-3 bg-slate-950 rounded-2xl hover:border-amber-500/50 hover:text-amber-500 border border-slate-800 transition-colors group text-slate-300">
                      <Ic d={IC.receipt} size={20} />
                      <span className="text-[10px] font-bold">Đặt giá</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Ic d={IC.gavel} size={28} />
                <p className="text-xs mt-2">Không có sản phẩm liên kết</p>
              </div>
            )}

            {/* Safety tips */}
            <div className="border-t border-slate-800 pt-4 mb-5">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Lưu ý an toàn</h4>
              <ul className="space-y-3">
                <li className="flex gap-2.5">
                  <Ic d={IC.shield} size={14} strokeWidth={2} className="text-slate-400" />
                  <p className="text-[10px] leading-relaxed text-slate-400">Luôn thanh toán qua nền tảng để được bảo vệ.</p>
                </li>
                <li className="flex gap-2.5 text-amber-500">
                  <Ic d={IC.info} size={14} strokeWidth={2} />
                  <p className="text-[10px] leading-relaxed text-amber-500/80">Phí vận chuyển được tính tự động khi thanh toán.</p>
                </li>
              </ul>
            </div>

            {/* Report button */}
            <button
              onClick={() => { reportConversation(activeConversation.id, 'Vi phạm'); }}
              className="w-full py-2.5 bg-slate-950 text-red-500 hover:bg-red-950/30 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-800"
            >
              <Ic d={IC.block} size={14} />Báo cáo người dùng
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ChatPage;
