// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Privacy.
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Helmet>
        <title>Chính sách Bảo mật — F-Bid</title>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Bảo vệ Dữ liệu
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 uppercase"
          >
            Chính sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Bảo mật</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Quyền riêng tư của bạn rất quan trọng với chúng tôi. Tìm hiểu cách F-Bid thu thập, sử dụng và bảo vệ thông tin của bạn.
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Thông tin Chúng tôi Thu thập</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                F-Bid thu thập các thông tin mà bạn chủ động cung cấp trực tiếp cho chúng tôi, bao gồm:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Thông tin tài khoản (trên, email, mật khẩu).</li>
                <li>Thông tin hồ sơ bổ sung (số điện thoại, địa chỉ giao hàng).</li>
                <li>Lịch sử đấu giá, tham gia mua bán và giao dịch.</li>
                <li>Hồ sơ về lịch sử hỗ trợ từ đội ngũ Chăm sóc khách hàng.</li>
                <li>Thông tin thiết bị và hệ điều hành khi bạn sử dụng ứng dụng hoặc trang web.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">2. Cách Chúng tôi Sử dụng Thông tin</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Thông tin thu thập được sẽ được sử dụng cho các mục đích:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Vận hành, duy trì và nâng cấp chất lượng của nền tảng đấu giá.</li>
                <li>Xử lý và xác thực các giao dịch từ phiên đấu giá.</li>
                <li>Gửi thông báo kỹ thuật, hỗ trợ trực tuyến.</li>
                <li>Lắng nghe và phản hồi ý kiến phản hồi hoặc các câu hỏi từ người dùng.</li>
                <li>Ngăn ngừa, phát hiện và xử lý các hành vi gian lận trên nền tảng.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">3. Bảo mật Dữ liệu</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Hệ thống F-Bid tận dụng đa dạng biện pháp bảo vệ dữ liệu, bao gồm:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Mã hóa dữ liệu tại lúc nghỉ và khi truyền trên internet.</li>
                <li>Xác thực an toàn bằng hình thức bảo mật nhiều lớp kết hợp (JWT).</li>
                <li>Thường xuyên tiến hành kiểm tra mã nguồn (Audit).</li>
                <li>Khoá quyền tiếp cận dữ liệu cá nhân theo nguyên tắc giới hạn người truy cập tối đa.</li>
              </ul>
              <p className="text-slate-400 text-sm opacity-80 mt-2">
                *Lưu ý: Bất kể các bước kể trên, vẫn chưa một hệ thống nào đảm bảo bảo mật trực tuyến là 100%. Dù đã cố gắng, chúng tôi không thể đảm bảo một độ bảo mật tuyệt đối.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">4. Dịch vụ Bên Thứ Ba</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Trong một số trường hợp, người tham gia trải nghiệm trên nền tảng có thể được kết nối, hoặc truyền dữ liệu qua các đối tác tin cậy:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Bên thứ ba quản lý máy chủ cho hệ thống email nội bộ.</li>
                <li>Bên cung cấp dịch vụ phân tích dữ liệu ứng dụng.</li>
                <li>Đơn vị trung gian chịu trách nhiệm xử lý các khoản thanh toán giao dịch.</li>
              </ul>
              <p className="text-slate-400 text-sm opacity-80 mt-2">
                Các bên nêu trên có quyền có điều khoản và chính sách riêng biệt. Chúng tôi sẽ khuyến khích người truy cập theo dõi.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">5. Quyền của Bạn</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Bạn sở hữu quyền pháp lý để:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4 ml-4">
                <li>Truy cập trực tiếp và cập nhật/xóa tài khoản của bạn.</li>
                <li>Hủy đăng ký/phản đói nhận cập nhật vào bất kỳ lúc nào.</li>
                <li>Gửi yêu cầu xóa bản sao dữ liệu bạn đang để lại nơi nền tảng.</li>
              </ul>
              <p className="text-slate-400 leading-relaxed">
                Để thực hiện quyền của mình, vui lòng sử dụng biểu mẫu <a href="/contact" className="text-amber-500 font-bold hover:underline">Liên hệ</a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">6. Trẻ em & Bảo mật</h2>
              <p className="text-slate-400 leading-relaxed">
                Hệ sinh thái này không được xây dựng chuyên biệt và khuyến khích cho người chưa đủ tuổi (dưới 18 tuổi). Chúng tôi không chủ ý và không mong muốn thu thập dữ liệu cá nhân của các nhóm trẻ. Nếu có nhầm lẫn xảy ra, gia đình hoàn toàn có thể báo cáo với cơ quan hỗ trợ và đề nghị gỡ bỏ khỏi hệ thống.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Thông tin Liên Hệ Dành Ghi Nhận Chính Sách Bảo Mật</h2>
              <p className="text-slate-400 leading-relaxed pb-6 text-center mt-12 border-t border-slate-800 pt-8">
                Bạn có thắc mắc về vấn đề liên quan hay đang quan tâm để bảo mật dữ liệu ở F-Bid? Xin phản hồi qua{' '}
                <a href="/contact" className="text-amber-500 font-bold hover:text-amber-400 hover:underline">Liên hệ ngay</a> hoặc trao đổi tại{' '}
                <a href="mailto:privacy@fbid.vn" className="text-amber-500 hover:text-amber-400 hover:underline">privacy@fbid.vn</a>
              </p>
            </section>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Privacy;
