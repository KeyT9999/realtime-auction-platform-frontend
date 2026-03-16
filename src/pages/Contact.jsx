import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { validateEmail, validateFullName } from '../utils/validators';
import { useAuth } from '../contexts/AuthContext';
import { contactService } from '../services/contactService';

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
    `w-full px-5 py-4 rounded-xl border bg-slate-900 ${errors[field] ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:ring-amber-500/20'} focus:ring-2 focus:border-amber-500/50 transition-all outline-none text-sm text-white placeholder-slate-500`;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Liên hệ — F-Bid</title>
        <meta name="description" content="Liên hệ với đội ngũ hỗ trợ F-Bid." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Trợ giúp
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Liên Hệ Với <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Chúng Tôi</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Đội ngũ chuyên gia của F-Bid luôn sẵn sàng hỗ trợ bạn trong mọi vấn đề liên quan đến nền tảng đấu giá trực tuyến.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── Form Card ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-black border border-slate-800 relative z-10">
              {/* Success / Error alerts */}
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <span className="text-emerald-400"><MI name="check_circle" size={22} /></span>
                  <p className="text-sm text-emerald-400 font-medium">Cảm ơn bạn! Chúng tôi sẽ phản hồi qua email sớm nhất có thể.</p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <span className="text-red-400"><MI name="error" size={22} /></span>
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={inputClass('name')}
                    />
                    {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Chủ đề</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass('subject')}
                    style={{ appearance: 'none' }}
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-xs text-red-400 ml-1">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nội dung</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Bạn cần hỗ trợ gì?"
                    className={`${inputClass('message')} resize-none`}
                  />
                  {errors.message && <p className="text-xs text-red-400 ml-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none text-slate-900 px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Đang gửi...
                    </span>
                  ) : 'Gửi Yêu Cầu'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ── Right Column ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Email card */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex gap-5 items-start hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MI name="mail" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Email Hỗ Trợ</h4>
                <p className="text-slate-400 text-sm mb-2">Đội ngũ kỹ thuật trực tuyến 24/7</p>
                <a href="mailto:support@fbid.vn" className="text-amber-500 font-bold hover:text-amber-400">
                  support@fbid.vn
                </a>
              </div>
            </div>

            {/* Support Hours card */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex gap-5 items-start hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MI name="schedule" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Giờ Làm Việc</h4>
                <p className="text-slate-400 text-sm mb-2">Thứ Hai — Thứ Sáu</p>
                <p className="text-white font-bold opacity-90">09:00 AM – 06:00 PM</p>
              </div>
            </div>

            {/* Response Time card */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex gap-5 items-start hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MI name="bolt" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Thời Gian Phản Hồi</h4>
                <p className="text-slate-400 text-sm mb-2">Trung bình phản hồi trong</p>
                <p className="text-emerald-400 font-bold">2 giờ hoặc ít hơn</p>
              </div>
            </div>

            {/* VIP Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-900 mt-6 relative overflow-hidden group shadow-lg shadow-amber-500/20">
              <div className="relative z-10">
                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Khách Hàng VIP?</h4>
                <p className="text-amber-900 font-medium text-sm leading-relaxed mb-6">
                  Bạn có tài sản giá trị lớn cần thẩm định và tổ chức phiên đấu giá độc quyền?
                </p>
                <a href="/about" className="inline-flex items-center gap-2 font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                  Tìm hiểu ngay <MI name="arrow_forward" size={18} />
                </a>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.15] text-slate-900 group-hover:scale-110 transition-transform duration-700">
                <MI name="diamond" size={120} weight={400} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
