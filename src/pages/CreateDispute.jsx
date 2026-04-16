// Mục đích tệp: Trien khai logic/chuc nang chinh cua file CreateDispute.
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { disputeService } from '../services/disputeService';

const REASONS = [
  { value: 0, label: '📦 Không nhận được hàng' },
  { value: 1, label: '📋 Không đúng mô tả' },
  { value: 2, label: '💔 Hàng bị hỏng / vỡ' },
  { value: 3, label: '🔄 Giao nhầm hàng' },
  { value: 4, label: '🚫 Người bán không giao hàng' },
  { value: 5, label: '💳 Người mua không thanh toán' },
  { value: 6, label: '⚠️ Nghi lừa đảo' },
  { value: 7, label: '📝 Lý do khác' },
];

export default function CreateDispute() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orderId: orderId || '',
    reason: 0,
    description: '',
    evidenceImages: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.orderId.trim()) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }
    if (form.description.length < 10) {
      setError('Mô tả phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const dispute = await disputeService.createDispute(form);
      navigate(`/disputes/${dispute.id}`);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo tranh chấp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <h1 className="text-2xl font-bold text-white">⚖️ Mở Tranh Chấp</h1>
            <p className="text-amber-100 mt-1">Mô tả vấn đề để chúng tôi giúp bạn giải quyết</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>
            )}

            {/* Order ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mã đơn hàng *</label>
              <input
                type="text"
                value={form.orderId}
                onChange={(e) => handleChange('orderId', e.target.value)}
                placeholder="Nhập mã đơn hàng..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                readOnly={!!orderId}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lý do tranh chấp *</label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleChange('reason', r.value)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      form.reason === r.value
                        ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết * <span className="text-gray-400 font-normal">(tối thiểu 10 ký tự)</span></label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả rõ vấn đề bạn gặp phải, chi tiết hàng hóa, thời gian..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length} ký tự</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || form.description.length < 10}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200"
            >
              {submitting ? '⏳ Đang gửi...' : '📤 Gửi tranh chấp'}
            </button>

            <p className="text-xs text-gray-400 text-center">Admin sẽ xem xét và phản hồi trong vòng 24 giờ</p>
          </form>
        </div>
      </div>
    </div>
  );
}
