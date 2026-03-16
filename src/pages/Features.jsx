import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

const Features = () => {
  const features = [
    { icon: 'bolt', title: 'Đấu giá Realtime', description: 'Tham gia đấu giá trực tiếp với luồng dữ liệu WebSocket không độ trễ. Nhìn thấy mọi lượt ra giá ngay lập tức.' },
    { icon: 'shield_locked', title: 'Bảo mật tuyệt đối', description: 'Xác thực đa tầng, mã hóa dữ liệu đầu cuối và hệ thống giám sát tự động ngăn chặn gian lận.' },
    { icon: 'manage_accounts', title: 'Quản lý toàn diện', description: 'Hồ sơ cá nhân chi tiết, theo dõi lịch sử giao dịch, quản lý danh sách yêu thích và cài đặt thông báo tùy chỉnh.' },
    { icon: 'admin_panel_settings', title: 'Hệ thống Quản trị', description: 'Công cụ kiểm duyệt mạnh mẽ giúp duy trì môi trường giao dịch công bằng, trong sạch.' },
    { icon: 'notifications_active', title: 'Thông báo tức thì', description: 'Nhận cảnh báo ngay lập tức qua App và Email khi có người trả giá cao hơn hoặc khi phiên đấu giá sắp kết thúc.' },
    { icon: 'devices', title: 'Tối ưu đa nền tảng', description: 'Trải nghiệm mượt mà, hoàn hảo trên mọi thiết bị từ Desktop, Tablet cho đến điện thoại di động.' },
    { icon: 'payments', title: 'Thanh toán an toàn', description: 'Tích hợp các cổng thanh toán uy tín, bảo lãnh giao dịch cho đến khi người mua nhận được hàng.' },
    { icon: 'speed', title: 'Hiệu suất tối đa', description: 'Hệ thống chịu tải cao, đảm bảo hoạt động ổn định kể cả trong những phiên đấu giá có hàng ngàn người tham gia.' },
    { icon: 'forum', title: 'Chat trực tiếp', description: 'Tương tác trực tiếp giữa người bán và người mua để giải đáp thắc mắc về sản phẩm ngay lập tức.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Tính năng nổi bật — F-Bid</title>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Khám phá sức mạnh
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Tính năng <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Đột phá</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Quên đi những trải nghiệm mua sắm nhàm chán. F-Bid trang bị mọi công cụ tinh túy nhất để bạn có thể làm chủ mọi phiên đấu giá.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/10 to-amber-600/10 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Features;
