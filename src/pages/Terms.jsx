import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Điều khoản Dịch vụ — F-Bid</title>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pháp lý
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Điều khoản <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Dịch vụ</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi tham gia nền tảng đấu giá của chúng tôi.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
        >
          <div className="prose prose-invert prose-amber max-w-none">
            <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-800">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">1. Giới thiệu</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Chào mừng bạn đến với F-Bid - Nền tảng Đấu giá Realtime. Các Điều khoản và Điều kiện này quản lý việc bạn sử dụng nền tảng của chúng tôi. Bằng cách truy cập hoặc sử dụng F-Bid, bạn đồng ý bị ràng buộc bởi các điều khoản này.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng nền tảng của chúng tôi.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">2. Trách nhiệm Người dùng</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Là người dùng của nền tảng, bạn có trách nhiệm:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Bảo mật thông tin đăng nhập tài khoản của bạn.</li>
                <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn.</li>
                <li>Cung cấp thông tin chính xác và trung thực.</li>
                <li>Tuân thủ tất cả các luật và quy định hiện hành.</li>
                <li>Tôn trọng quyền của những người dùng khác.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">3. Quy tắc Nền tảng</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Khi sử dụng nền tảng, bạn KHÔNG ĐƯỢC:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Tham gia vào các hành vi lừa đảo hoặc gian lận.</li>
                <li>Thao túng quá trình đấu giá hoặc thổi giá trái phép.</li>
                <li>Sử dụng hệ thống tự động/bot để can thiệp đấu giá.</li>
                <li>Quấy rối, lạm dụng hoặc gây hại cho người dùng khác.</li>
                <li>Vi phạm bất kỳ luật hoặc quy định hiện hành nào.</li>
                <li>Cố gắng truy cập trái phép vào hệ thống nền tảng.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">4. Điều khoản Đấu Giá (Bidding)</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Khi tham gia các phiên đấu giá:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Mọi lượt đặt giá (bid) là chính thức và không thể rút lại sau khi đã đặt.</li>
                <li>Bạn có nghĩa vụ pháp lý phải hoàn thành giao dịch (mua) nếu bạn giành chiến thắng.</li>
                <li>Mọi lượt đặt giá phải được thực hiện với thiện chí.</li>
                <li>Hệ thống có quyền hủy các lượt đấu giá nếu phát hiện vi phạm quy tắc.</li>
                <li>Người chiến thắng phải hoàn tất thanh toán trong khung thời gian quy định.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">5. Điều khoản Thanh toán</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Bằng cách đặt giá, bạn đồng ý:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Hoàn tất thanh toán nếu bạn thắng đấu giá.</li>
                <li>Thanh toán bất kỳ khoản phí hoặc phụ phí hiện hành nào đã được thông báo.</li>
                <li>Chỉ sử dụng các phương thức thanh toán hợp lệ (VNPay, mã QR, thẻ ngân hàng).</li>
                <li>Chịu trách nhiệm đối với các khoản phí xử lý thanh toán (nếu có).</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">6. Giải quyết Tranh chấp</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Trong trường hợp có tranh chấp xảy ra:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Liên hệ với đội ngũ hỗ trợ của chúng tôi trước tiên để cố gắng giải quyết hòa giải.</li>
                <li>Chúng tôi sẽ điều tra tranh chấp một cách công bằng và nhanh chóng.</li>
                <li>Quyết định của F-Bid liên quan đến các tranh chấp nội bộ là quyết định cuối cùng.</li>
                <li>Các tranh chấp pháp lý sẽ được giải quyết theo luật định của nước sở tại.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">7. Sửa đổi Điều khoản</h2>
              <p className="text-slate-400 leading-relaxed">
                Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các sửa đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Việc bạn tiếp tục sử dụng nền tảng sau những thay đổi cấu thành sự chấp nhận với các điều khoản mới. Chúng tôi sẽ thông báo cho người dùng về những thay đổi quan trọng qua email hoặc thông báo trên nền tảng.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">8. Giới hạn Trách nhiệm</h2>
              <p className="text-slate-400 leading-relaxed">
                Nền tảng của chúng tôi được cung cấp "nguyên trạng" mà không có bất kỳ bảo đảm nào. Chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc bạn sử dụng nền tảng. Tổng trách nhiệm của chúng tôi được giới hạn trong số tiền bạn đã thanh toán cho chúng tôi (nếu có) khi sử dụng dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Liên hệ</h2>
              <p className="text-slate-400 leading-relaxed pb-6 text-center mt-12 border-t border-slate-800 pt-8">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ, vui lòng liên hệ thông qua{' '}
                <a href="/contact" className="text-amber-500 font-bold hover:text-amber-400 hover:underline">trang Liên hệ</a> của chúng tôi.
              </p>
            </section>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Terms;
