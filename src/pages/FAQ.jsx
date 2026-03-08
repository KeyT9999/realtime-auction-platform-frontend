import Section from '../components/common/Section';
import Accordion from '../components/common/Accordion';

const FAQ = () => {
  const faqs = [
    { question: 'Làm thế nào để tạo tài khoản?', answer: 'Tạo tài khoản rất dễ dàng! Nhấp vào "Đăng ký", nhập email và mật khẩu, hoặc sử dụng Google để đăng ký nhanh hơn. Bạn cần xác thực email trước khi bắt đầu đấu giá.' },
    { question: 'Nền tảng có an toàn không?', answer: 'Có, chúng tôi rất coi trọng bảo mật. Chúng tôi sử dụng mã hóa tiêu chuẩn ngành, JWT tokens và tuân thủ các thực hành tốt nhất về bảo vệ dữ liệu.' },
    { question: 'Đấu giá realtime hoạt động như thế nào?', answer: 'Nền tảng sử dụng công nghệ giao tiếp realtime để cập nhật tất cả người dùng ngay khi có lượt đấu. Bạn sẽ thấy cập nhật giá tức thì.' },
    { question: 'Điều gì xảy ra khi tôi thắng đấu giá?', answer: 'Nếu thắng đấu giá, bạn sẽ nhận thông báo. Sau đó cần hoàn tất thanh toán theo hướng dẫn. Khi thanh toán được xác nhận, người bán sẽ phối hợp giao hàng.' },
    { question: 'Tôi có thể hủy đấu giá không?', answer: 'Các lượt đấu giá thường là chính thức khi đã đặt. Tuy nhiên, nếu có lo ngại, xin liên hệ đội hỗ trợ càng sớm càng tốt.' },
    { question: 'Làm sao để đặt lại mật khẩu?', answer: 'Nhấp "Quên mật khẩu" trên trang đăng nhập, nhập email và chúng tôi sẽ gửi mã OTP hoặc liên kết đặt lại.' },
    { question: 'Các phương thức thanh toán nào được chấp nhận?', answer: 'Hiện tại hỗ trợ thanh toán qua PayOS (VNPay, QR Code). Kiểm tra chi tiết đấu giá để biết phương thức cụ thể.' },
    { question: 'Nếu tôi gặp vấn đề với tài khoản?', answer: 'Vui lòng liên hệ đội hỗ trợ qua trang Liên hệ. Chúng tôi sẽ phản hồi nhanh nhất có thể.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden gradient-hero">
        <div className="relative section-container pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="badge-primary mb-6 mx-auto">FAQ</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Câu hỏi <span className="text-primary">thường gặp</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Tìm câu trả lời cho các câu hỏi phổ biến về nền tảng
            </p>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <Accordion key={index} title={faq.question}>
              <p className="text-slate-500 leading-relaxed">{faq.answer}</p>
            </Accordion>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default FAQ;
