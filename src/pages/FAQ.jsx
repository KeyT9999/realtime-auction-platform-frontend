import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import Accordion from '../components/common/Accordion';

const FAQ = () => {
  const faqs = [
    { question: 'Làm thế nào để tạo tài khoản?', answer: 'Tạo tài khoản rất dễ dàng! Nhấp vào "Đăng nhập", chọn "Đăng ký", nhập email và mật khẩu, hoặc sử dụng tài khoản Google để đăng ký siêu tốc. Bạn cần xác thực email trước khi bắt đầu đặt giá.' },
    { question: 'Nền tảng của bạn có an toàn không?', answer: 'Có, chúng tôi coi trọng bảo mật tuyệt đối. Chúng tôi sử dụng mã hóa tiêu chuẩn ngành, JWT tokens và tuân thủ các thực hành tốt nhất về bảo vệ dữ liệu người dùng và giao dịch.' },
    { question: 'Đấu giá realtime hoạt động như thế nào?', answer: 'Nền tảng sử dụng công nghệ WebSockets (SignalR) để giao tiếp thời gian thực. Mỗi khi có người đặt giá, tất cả những người đang xem sản phẩm đó sẽ thấy mức giá nhảy số ngay lập tức mà không cần tải lại trang.' },
    { question: 'Điều gì xảy ra khi tôi thắng đấu giá?', answer: 'Ngay khi phiên đấu giá kết thúc và bạn là người trả giá cao nhất, bạn sẽ nhận được thông báo qua email và hệ thống. Sau đó, bạn cần hoàn tất thanh toán theo hướng dẫn. Khi thanh toán được xác nhận, hệ thống sẽ phối hợp với người bán để giao hàng.' },
    { question: 'Tôi có thể rút lại mức giá đã đặt không?', answer: 'Không. Để đảm bảo tính công bằng và nghiêm túc, mọi lượt đặt giá (Bid) đều được coi là cam kết mua hàng chính thức. Vui lòng cân nhắc kỹ trước khi bấm xác nhận đặt giá.' },
    { question: 'Làm sao để đặt lại mật khẩu?', answer: 'Tại màn hình Đăng nhập, hãy nhấp vào "Quên mật khẩu". Nhập email của bạn và chúng tôi sẽ gửi mã OTP gồm 6 chữ số để bạn thiết lập lại mật khẩu an toàn.' },
    { question: 'Những phương thức thanh toán nào được chấp nhận?', answer: 'Chủ yếu chúng tôi hỗ trợ cổng thanh toán qua PayOS (chuyển khoản VNPay, quét mã QR nội địa). Mọi giao dịch đều được ghi nhận tự động 24/7.' },
    { question: 'Nếu người bán không giao hàng thì sao?', answer: 'Nền tảng của chúng tôi có cơ chế bảo vệ người mua. Tiền của bạn sẽ được giữ an toàn trong hệ thống cho tới khi bạn xác nhận đã nhận hàng đúng mô tả. Nếu có tranh chấp, đội ngũ quản trị sẽ vào cuộc.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Câu hỏi thường gặp — F-Bid</title>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Hỗ trợ người dùng
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Câu hỏi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Thường gặp</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Chúng tôi tổng hợp những giải đáp nhanh nhất cho những thắc mắc phổ biến về trải nghiệm và hoạt động trên F-Bid.
          </motion.p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
            >
              <Accordion title={faq.question} defaultOpen={index === 0}>
                {faq.answer}
              </Accordion>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Vẫn còn thắc mắc?</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">
            Nếu bạn không tìm thấy câu trả lời ở đây, đừng ngần ngại liên hệ trực tiếp với đội ngũ hỗ trợ nhiệt tình của chúng tôi.
          </p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3.5 rounded-xl transition-all relative z-10">
            Liên hệ hỗ trợ <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default FAQ;
