import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { disputeService } from '../services/disputeService';

const STATUS_CONFIG = {
  0: { label: 'Đang mở', color: 'bg-amber-100 text-amber-700', icon: '🔔' },
  1: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700', icon: '🔍' },
  2: { label: 'Buyer thắng', color: 'bg-green-100 text-green-700', icon: '✅' },
  3: { label: 'Seller thắng', color: 'bg-green-100 text-green-700', icon: '✅' },
  4: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600', icon: '🔒' },
};

const REASON_TEXT = {
  0: 'Không nhận được hàng',
  1: 'Không đúng mô tả',
  2: 'Hàng bị hỏng',
  3: 'Giao nhầm hàng',
  4: 'Seller không giao hàng',
  5: 'Buyer không thanh toán',
  6: 'Nghi lừa đảo',
  7: 'Lý do khác',
};

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getMyDisputes();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải danh sách tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚖️ Tranh chấp của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý các tranh chấp đơn hàng</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">{error}</div>
        )}

        {disputes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🕊️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có tranh chấp nào</h3>
            <p className="text-gray-500">Bạn chưa có tranh chấp nào. Nếu có vấn đề với đơn hàng, bạn có thể mở tranh chấp từ trang chi tiết đơn hàng.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => {
              const status = STATUS_CONFIG[d.status] || STATUS_CONFIG[0];
              return (
                <Link
                  key={d.id}
                  to={`/disputes/${d.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {d.productImage ? (
                        <img src={d.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {d.productTitle || 'Sản phẩm'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Lý do:</span> {REASON_TEXT[d.reason] || 'Không xác định'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Mở bởi: {d.openedBy === 'Buyer' ? '🛒 Người mua' : '🏪 Người bán'} · {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                      {d.resolution && (
                        <p className="text-sm text-green-600 mt-1 font-medium">📋 {d.resolution}</p>
                      )}
                    </div>

                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
