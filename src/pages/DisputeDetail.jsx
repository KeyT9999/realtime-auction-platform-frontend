import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { disputeService } from '../services/disputeService';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  0: { label: 'Đang mở', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🔔' },
  1: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🔍' },
  2: { label: 'Buyer thắng', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
  3: { label: 'Seller thắng', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
  4: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '🔒' },
};

const REASON_TEXT = {
  0: 'Không nhận được hàng', 1: 'Không đúng mô tả', 2: 'Hàng bị hỏng',
  3: 'Giao nhầm hàng', 4: 'Seller không giao hàng', 5: 'Buyer không thanh toán',
  6: 'Nghi lừa đảo', 7: 'Lý do khác',
};

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadDispute();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dispute?.messages]);

  const loadDispute = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getDisputeById(id);
      setDispute(data);
    } catch (err) {
      console.error('Failed to load dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    try {
      setSending(true);
      const newMsg = await disputeService.sendMessage(id, { content: message, attachments: [] });
      setDispute(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMsg]
      }));
      setMessage('');
    } catch (err) {
      alert(err.message || 'Lỗi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Bạn có chắc muốn đóng tranh chấp này?')) return;
    try {
      setClosing(true);
      await disputeService.closeDispute(id);
      await loadDispute();
    } catch (err) {
      alert(err.message || 'Lỗi đóng tranh chấp');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-700">Không tìm thấy tranh chấp</h2>
          <button onClick={() => navigate('/disputes')} className="mt-4 text-blue-600 hover:underline">← Quay lại</button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[dispute.status] || STATUS_CONFIG[0];
  const isResolved = [2, 3, 4].includes(dispute.status);
  const canSendMessage = !isResolved;
  const isOpener = (dispute.openedBy === 'Buyer' && dispute.buyerId === user?.id) ||
                   (dispute.openedBy === 'Seller' && dispute.sellerId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate('/disputes')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại danh sách
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {dispute.productImage ? (
                <img src={dispute.productImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{dispute.productTitle || 'Tranh chấp'}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <p>📋 <strong>Lý do:</strong> {REASON_TEXT[dispute.reason]}</p>
                <p>👤 <strong>Mở bởi:</strong> {dispute.openedBy === 'Buyer' ? 'Người mua' : 'Người bán'}</p>
                <p>🛒 <strong>Người mua:</strong> {dispute.buyerName}</p>
                <p>🏪 <strong>Người bán:</strong> {dispute.sellerName}</p>
                <p>📅 <strong>Ngày tạo:</strong> {new Date(dispute.createdAt).toLocaleDateString('vi-VN')}</p>
                {dispute.resolvedAt && (
                  <p>✅ <strong>Ngày giải quyết:</strong> {new Date(dispute.resolvedAt).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-2">📝 Mô tả chi tiết</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {/* Evidence Images */}
          {dispute.evidenceImages?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">📸 Bằng chứng</h3>
              <div className="flex gap-3 overflow-x-auto">
                {dispute.evidenceImages.map((img, i) => (
                  <img key={i} src={img} alt={`Bằng chứng ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {dispute.adminNote && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-700 mb-1">⚖️ Phán quyết của Admin</h3>
              <p className="text-blue-600">{dispute.adminNote}</p>
              {dispute.resolution && <p className="text-blue-500 text-sm mt-1">{dispute.resolution}</p>}
            </div>
          )}

          {/* Actions */}
          {!isResolved && isOpener && (
            <div className="mt-4 flex gap-3">
              <button onClick={handleClose} disabled={closing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium">
                {closing ? 'Đang đóng...' : '🔒 Đóng tranh chấp'}
              </button>
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">💬 Tin nhắn ({dispute.messages?.length || 0})</h2>
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {(!dispute.messages || dispute.messages.length === 0) ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p>Chưa có tin nhắn nào</p>
              </div>
            ) : (
              dispute.messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const roleColors = {
                  Admin: 'bg-purple-50 border-purple-200',
                  Buyer: 'bg-blue-50 border-blue-200',
                  Seller: 'bg-amber-50 border-amber-200',
                };
                const roleBadge = {
                  Admin: '👑 Admin',
                  Buyer: '🛒 Người mua',
                  Seller: '🏪 Người bán',
                };
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-2xl border ${isMe ? 'bg-blue-50 border-blue-200' : roleColors[msg.senderRole] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">{roleBadge[msg.senderRole] || msg.senderRole}</span>
                        <span className="text-xs text-gray-400">· {msg.senderName}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                      {msg.attachments?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {msg.attachments.map((a, i) => (
                            <img key={i} src={a} alt="" className="w-16 h-16 object-cover rounded-lg cursor-pointer" onClick={() => window.open(a, '_blank')} />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {canSendMessage && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <button type="submit" disabled={!message.trim() || sending}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                {sending ? '...' : 'Gửi'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
