import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { validateEmail, validateFullName } from '../utils/validators';
import { useAuth } from '../contexts/AuthContext';
import { contactService } from '../services/contactService';

// Material icon helper
const MI = ({ name, size = 20, weight = 400 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, fontVariationSettings: `'wght' ${weight}` }}>{name}</span>
);

const SUBJECT_OPTIONS = [
  'Câu hỏi chung',
  'Hỗ trợ kỹ thuật',
  'Yêu cầu ký gửi',
  'Báo cáo sự cố',
  'Góp ý / Phản hồi',
];

const Contact = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccess(false);
  };

  const validate = () => {
    const newErrors = {};
    const nameValidation = validateFullName(formData.name);
    if (!nameValidation.isValid) newErrors.name = nameValidation.message;
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.subject || formData.subject.trim().length < 3) newErrors.subject = 'Chủ đề ít nhất 3 ký tự';
    if (!formData.message || formData.message.trim().length < 10) newErrors.message = 'Tin nhắn ít nhất 10 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await contactService.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: SUBJECT_OPTIONS[0], message: '' });
    } catch (err) {
      setError(err.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-5 py-4 rounded-xl border ${errors[field] ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-600'} focus:ring-2 focus:border-transparent transition-all outline-none text-sm text-slate-800 placeholder-slate-400`;

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Helmet>
        <title>Liên hệ — Đấu Giá Realtime</title>
        <meta name="description" content="Liên hệ với đội ngũ hỗ trợ Đấu Giá Realtime." />
      </Helmet>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-5">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi vấn đề liên quan đến đấu giá trực tuyến.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── Form Card ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              {/* Success / Error alerts */}
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <span className="text-emerald-600"><MI name="check_circle" size={22} /></span>
                  <p className="text-sm text-emerald-700 font-medium">Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <span className="text-red-500"><MI name="error" size={22} /></span>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={inputClass('name')}
                    />
                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Chủ đề</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass('subject')}
                    style={{ appearance: 'none' }}
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-xs text-red-500 ml-1">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Nội dung</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Bạn cần hỗ trợ gì?"
                    className={`${inputClass('message')} resize-none`}
                  />
                  {errors.message && <p className="text-xs text-red-500 ml-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:pointer-events-none text-white px-10 py-4 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-0.5 shadow-xl shadow-blue-600/20 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Đang gửi...
                    </span>
                  ) : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-2xl font-bold text-slate-900">Thông tin liên hệ</h3>

            {/* Email card */}
            <div className="ct-info-card">
              <div className="ct-info-icon">
                <MI name="mail" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1 text-slate-900">Email</h4>
                <p className="text-slate-500 text-sm mb-1.5">Đội ngũ hỗ trợ luôn sẵn sàng.</p>
                <a href="mailto:support@realtimeauction.com" className="text-blue-600 font-semibold text-sm hover:underline">
                  support@realtimeauction.com
                </a>
              </div>
            </div>

            {/* Support Hours card */}
            <div className="ct-info-card">
              <div className="ct-info-icon">
                <MI name="schedule" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1 text-slate-900">Giờ hỗ trợ</h4>
                <p className="text-slate-500 text-sm">Thứ Hai — Thứ Sáu</p>
                <p className="font-semibold text-sm text-slate-800">9:00 SA – 6:00 CH</p>
              </div>
            </div>

            {/* Response Time card */}
            <div className="ct-info-card">
              <div className="ct-info-icon">
                <MI name="bolt" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1 text-slate-900">Thời gian phản hồi</h4>
                <p className="text-slate-500 text-sm">Trung bình phản hồi trong</p>
                <p className="font-semibold text-sm text-blue-600">2 giờ hoặc ít hơn</p>
              </div>
            </div>

            {/* VIP Card */}
            <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3">Ký gửi VIP?</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Muốn đấu giá bộ sưu tập giá trị cao? Dịch vụ môi giới riêng tư với hỗ trợ tận tâm.
                </p>
                <a href="/sell" className="text-sm font-bold border-b-2 border-blue-500 pb-0.5 hover:text-blue-400 transition-colors">
                  Tìm hiểu thêm →
                </a>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-[0.08] group-hover:scale-110 transition-transform duration-700">
                <MI name="workspace_premium" size={120} weight={300} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .ct-info-card {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          padding: 1.25rem;
          border-radius: 1rem;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .ct-info-card:hover {
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .ct-info-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(37,99,235,0.08);
          color: #2563EB;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Contact;
