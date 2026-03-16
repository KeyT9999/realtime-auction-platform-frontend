import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gavel, ArrowRight, Shield, Zap, TrendingUp, Users,
  Star, CheckCircle2, Timer, ChevronDown, Play
} from 'lucide-react';

const heroImages = [
  'https://images.unsplash.com/photo-1690220108593-3e1f8afb4d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'https://images.unsplash.com/photo-1636639821444-479368c96514?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'https://images.unsplash.com/photo-1557244906-bc74b27d1675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
];

const features = [
  {
    icon: Zap,
    title: 'Đấu giá Realtime',
    description: 'Xem giá thay đổi theo từng giây với công nghệ WebSocket hiện đại.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Bảo mật tuyệt đối',
    description: 'Hệ thống xác thực đa lớp với OTP và mã hóa SSL đảm bảo an toàn.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Giá tốt nhất',
    description: 'Thuật toán thông minh giúp bạn tìm được mức giá tốt nhất.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Users,
    title: 'Cộng đồng lớn mạnh',
    description: 'Hơn 50,000 người dùng đang tham gia đấu giá mỗi ngày.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

const stats = [
  { value: '50,000+', label: 'Người dùng đăng ký' },
  { value: '1M+', label: 'Lượt đấu giá thành công' },
  { value: '10,000+', label: 'Phiên đấu giá mỗi tháng' },
  { value: '99.9%', label: 'Uptime đảm bảo' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Tạo tài khoản',
    description: 'Đăng ký nhanh chóng chỉ mất 1 phút.',
  },
  {
    step: '02',
    title: 'Khám phá phiên đấu giá',
    description: 'Duyệt qua hàng nghìn mặt hàng độc đáo.',
  },
  {
    step: '03',
    title: 'Đặt giá và thắng',
    description: 'Đặt giá thầu real-time và nhận thông báo ngay.',
  },
];

const testimonials = [
  {
    name: 'Nguyễn Thị Hương',
    role: 'Nhà sưu tầm đồng hồ',
    avatar: 'H',
    content: 'BidZone giúp tôi tìm được những chiếc đồng hồ hiếm với giá hợp lý.',
    rating: 5,
  },
  {
    name: 'Trần Văn Minh',
    role: 'Doanh nhân',
    avatar: 'M',
    content: 'Tôi đã đấu giá thành công chiếc xe cổ điển mơ ước qua BidZone.',
    rating: 5,
  },
  {
    name: 'Lê Thu Trang',
    role: 'Họa sĩ',
    avatar: 'T',
    content: 'Bán tranh qua BidZone dễ dàng hơn tôi nghĩ.',
    rating: 5,
  },
];

export default function LandingPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 17 });

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(imageInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 34; s = 17; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold">Bid<span className="text-amber-400">Zone</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['Tính năng', 'Cách hoạt động', 'Giá cả', 'Về chúng tôi'].map(item => (
              <a key={item} href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Đang có 1,247 phiên đấu giá trực tiếp
              </span>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                Đấu giá{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                  thông minh
                </span>
                ,<br />
                Mua sắm{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  đẳng cấp
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
                Nền tảng đấu giá trực tuyến realtime hàng đầu Việt Nam.
              </p>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Link
                to="/register"
                className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/30 text-sm"
              >
                Bắt đầu ngay — Miễn phí
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center gap-2.5 px-7 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-2xl transition-all text-sm font-medium backdrop-blur-sm">
                <Play className="w-4 h-4 text-amber-400" />
                Xem demo
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {['Bảo mật SSL', 'Xác thực OTP', 'Hỗ trợ 24/7'].map(badge => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-500" />
          </motion.div>
        </div>
      </section>

      {/* Live Auction Banner */}
      <section className="py-12 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-slate-900/20 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Timer className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Đang đếm ngược</p>
                <p className="text-white font-bold">Đồng hồ Rolex Submariner — Giá hiện tại: 145,000,000₫</p>
              </div>
            </div>
            <div className="flex items-center">
              {[
                { label: 'GIỜ', value: countdown.h },
                { label: 'PHÚT', value: countdown.m },
                { label: 'GIÂY', value: countdown.s },
              ].map((unit, idx) => (
                <div key={unit.label} className="flex items-center">
                  {idx > 0 && <span className="text-amber-500 font-bold text-xl mx-1">:</span>}
                  <div className="flex flex-col items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 min-w-[52px]">
                    <span className="text-2xl font-black text-white tabular-nums">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">{unit.label}</span>
                  </div>
                </div>
              ))}
              <Link
                to="/register"
                className="ml-3 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-all"
              >
                Đặt giá
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  {stat.value}
                </div>
                <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Tính năng</span>
            <h2 className="text-4xl font-black mt-2">Tại sao chọn BidZone?</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">Chúng tôi cung cấp trải nghiệm đấu giá tốt nhất</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-amber-500/30 transition-all group"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Quy trình</span>
            <h2 className="text-4xl font-black mt-2">Cách hoạt động</h2>
            <p className="text-slate-400 mt-3">Chỉ 3 bước đơn giản để bắt đầu đấu giá</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center"
              >
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
                )}
                <div className="relative inline-flex w-16 h-16 items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-slate-900 text-2xl font-black mb-5 shadow-xl shadow-amber-500/30">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Đánh giá</span>
            <h2 className="text-4xl font-black mt-2">Người dùng nói gì?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30" />
            <div className="absolute inset-0 border border-amber-500/30 rounded-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black">
                Sẵn sàng tham gia?
              </h2>
              <p className="text-slate-400 mt-4 text-lg max-w-md mx-auto">
                Đăng ký ngay hôm nay và nhận 5 lượt đấu giá miễn phí cho người mới.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/30 text-sm"
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-slate-500 rounded-2xl transition-all text-sm font-medium"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Gavel className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-lg font-bold">Bid<span className="text-amber-400">Zone</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              {['Điều khoản', 'Bảo mật', 'Liên hệ', 'Blog'].map(item => (
                <a key={item} href="#" className="hover:text-slate-300 transition-colors">{item}</a>
              ))}
            </div>
            <p className="text-slate-600 text-sm">© 2026 BidZone. Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
