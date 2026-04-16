// Mục đích tệp: Trien khai logic/chuc nang chinh cua file HowItWorks.
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Tạo tài khoản',
      description: 'Đăng ký nhanh chóng bằng email hoặc tài khoản Google. Xác thực để kích hoạt toàn bộ tính năng và bắt đầu khám phá.',
      details: [
        'Quy trình đăng ký siêu tốc',
        'Hỗ trợ đăng nhập Google',
        'Bảo mật thông tin tuyệt đối',
      ],
    },
    {
      number: '2',
      title: 'Khám phá đấu giá',
      description: 'Duyệt qua hàng ngàn sản phẩm đang được đấu giá. Sử dụng công cụ tìm kiếm thông minh và bộ lọc để tìm chính xác món đồ bạn cần.',
      details: [
        'Xem tất cả các phiên đang diễn ra',
        'Lọc theo danh mục và mức giá',
        'Hình ảnh và mô tả chi tiết',
      ],
    },
    {
      number: '3',
      title: 'Tham gia trả giá',
      description: 'Trải nghiệm hệ thống đấu giá thời gian thực. Theo dõi bước giá thay đổi từng giây và tự tin đặt mức giá chiến thắng.',
      details: [
        'Cập nhật giá theo thời gian thực',
        'Nhận thông báo khi bị vượt giá',
        'Hệ thống đấu giá tự động (Auto-bid)',
      ],
    },
    {
      number: '4',
      title: 'Chiến thắng & Thanh toán',
      description: 'Khi trở thành người chiến thắng, hệ thống sẽ hướng dẫn bạn thanh toán an toàn và phối hợp vận chuyển với người bán.',
      details: [
        'Thanh toán bảo mật an toàn',
        'Xác nhận giao dịch minh bạch',
        'Hỗ trợ theo dõi đơn hàng',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Cách hoạt động — F-Bid</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Hướng dẫn bắt đầu
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Cách thức <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Hoạt động</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Bốn bước đơn giản để bắt đầu hành trình săn lùng những món đồ độc đáo với nền tảng đấu giá thời gian thực đỉnh cao.
          </motion.p>
        </div>
      </section>

      {/* Steps List */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 relative">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Vertical connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-10 top-20 w-px h-full bg-gradient-to-b from-amber-500/50 to-transparent z-0" style={{ height: 'calc(100% + 2rem)' }} />
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 relative z-10 shadow-xl group-hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-2xl font-black shadow-lg shadow-amber-500/20">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-400">
                          <span className="material-symbols-outlined text-amber-500 text-base mr-2 shrink-0">check_circle</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
