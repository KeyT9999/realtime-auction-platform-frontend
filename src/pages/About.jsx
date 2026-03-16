import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const values = [
    { icon: 'handshake', title: 'Tin cậy', description: 'Chúng tôi ưu tiên bảo mật và minh bạch trong mọi giao dịch, xây dựng môi trường an toàn tuyệt đối.' },
    { icon: 'policy', title: 'Minh bạch', description: 'Quy trình rõ ràng và giao tiếp trung thực giúp người dùng luôn nắm bắt chính xác quyền lợi.' },
    { icon: 'lightbulb', title: 'Đổi mới', description: 'Liên tục cập nhật công nghệ thời gian thực tiên tiến nhất để tối ưu hóa trải nghiệm.' },
    { icon: 'person', title: 'Người dùng là trung tâm', description: 'Mọi tính năng đều được thiết kế dựa trên sự hài lòng và tiện ích của người sử dụng.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Về chúng tôi — F-Bid</title>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Về chúng tôi
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Sứ mệnh của <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">F-Bid</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Chúng tôi xây dựng tương lai của trải nghiệm mua sắm đẳng cấp với công nghệ đấu giá trực tuyến thời gian thực minh bạch và hiện đại nhất.
          </motion.p>
        </div>
      </section>

      {/* Story & Mission Split */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-amber-500 text-2xl">book_2</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Câu chuyện của chúng tôi</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              F-Bid ra đời từ khát vọng cách mạng hóa mô hình thương mại truyền thống. Nhận thấy các hình thức mua bán thông thường thiếu đi sự kịch tính và minh bạch về giá trị thực, chúng tôi đã tạo ra một nền tảng chuyên biệt cho hàng hóa cao cấp.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Từ một nhóm nhỏ đam mê công nghệ tại Việt Nam, F-Bid nhanh chóng vươn lên thành nền tảng đáng tin cậy kết nối hàng ngàn nhà sưu tầm và người mua thông thái.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-amber-500 text-2xl">rocket_launch</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Tầm nhìn chiến lược</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Mục tiêu của F-Bid là trở thành tiêu chuẩn vàng cho các sàn thương mại điện tử đấu giá trực tuyến tại Đông Nam Á. Chúng tôi xóa bỏ mọi rào cản địa lý, kết nối người có nhu cầu và người có sản phẩm độc đáo trong vài giây.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Bằng việc ứng dụng cơ sở hạ tầng thời gian thực (real-time) tiên tiến, chúng tôi cam kết mọi lệnh đặt giá, mọi phiên giao dịch đều mượt mà và không có độ trễ.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Giá trị cốt lõi</h2>
          <p className="text-slate-400">Những nguyên tắc bất biến định hướng sự phát triển của F-Bid.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center mb-5 text-amber-500">
                <span className="material-symbols-outlined">{val.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{val.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{val.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
