import Section from '../components/common/Section';
import FeatureCard from '../components/common/FeatureCard';

const Features = () => {
  const features = [
    { icon: '⚡', title: 'Đấu giá Realtime', description: 'Tham gia đấu giá trực tiếp với cập nhật giá tức thì. Xem giá đấu khi chúng xảy ra.' },
    { icon: '🔒', title: 'Xác thực An toàn', description: 'Xác thực đa tầng với JWT tokens, xác thực email và quản lý mật khẩu an toàn.' },
    { icon: '👥', title: 'Quản lý Người dùng', description: 'Hồ sơ người dùng toàn diện, cài đặt tài khoản và bảng điều khiển cá nhân hóa.' },
    { icon: '👑', title: 'Bảng Admin', description: 'Công cụ admin mạnh mẽ cho quản lý người dùng, kiểm duyệt và giám sát nền tảng.' },
    { icon: '📧', title: 'Thông báo Email', description: 'Cập nhật kịp thời qua email về hoạt động tài khoản, đấu giá và cảnh báo quan trọng.' },
    { icon: '📱', title: 'Tương thích Mobile', description: 'Thiết kế responsive hoạt động mượt mà trên desktop, tablet và thiết bị di động.' },
    { icon: '🔐', title: 'Bảo mật Tài khoản', description: 'Tính năng bảo mật nâng cao bao gồm khóa tài khoản, phân quyền và giám sát hoạt động.' },
    { icon: '🌐', title: 'Công nghệ Hiện đại', description: 'Được xây dựng với React, .NET, MongoDB và SignalR cho hiệu suất tối ưu.' },
    { icon: '💬', title: 'Chat Realtime', description: 'Nhắn tin trực tiếp giữa người mua và người bán với cập nhật tức thì.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-primary rounded-full blur-[120px]"></div>
        </div>
        <div className="relative section-container pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="badge-primary mb-6 mx-auto">Tính năng</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Tính năng <span className="text-primary">Nền tảng</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Mọi thứ bạn cần cho trải nghiệm đấu giá tuyệt vời
            </p>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Features;
