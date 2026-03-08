import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Section from '../components/common/Section';
import FeatureCard from '../components/common/FeatureCard';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mainFeatures = [
    {
      icon: '⚡',
      title: 'Đấu giá Realtime',
      description: 'Trải nghiệm đấu giá trực tiếp với cập nhật giá đấu tức thì và thông báo realtime.',
    },
    {
      icon: '🔒',
      title: 'Nền tảng An toàn',
      description: 'Dữ liệu và giao dịch của bạn được bảo vệ bằng bảo mật tiêu chuẩn ngành.',
    },
    {
      icon: '👥',
      title: 'Quản lý Người dùng',
      description: 'Quản lý tài khoản dễ dàng với tùy chỉnh hồ sơ và tùy chọn cá nhân.',
    },
    {
      icon: '📱',
      title: 'Tương thích Mobile',
      description: 'Truy cập nền tảng từ mọi thiết bị, mọi nơi, mọi lúc.',
    },
  ];

  const steps = [
    {
      number: '1',
      icon: 'person_add',
      title: 'Tạo tài khoản',
      description: 'Đăng ký trong vài giây với email hoặc tài khoản Google. Xác thực email để bắt đầu.',
    },
    {
      number: '2',
      icon: 'search',
      title: 'Duyệt đấu giá',
      description: 'Khám phá các đấu giá đang diễn ra, lọc theo danh mục và tìm các món đồ bạn yêu thích.',
    },
    {
      number: '3',
      icon: 'gavel',
      title: 'Đặt giá đấu',
      description: 'Tham gia đấu giá realtime với cập nhật tức thì và thông báo.',
    },
    {
      number: '4',
      icon: 'verified',
      title: 'Thắng & Hoàn tất',
      description: 'Nếu bạn thắng, hoàn tất giao dịch an toàn và nhận hàng của bạn.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full w-fit">
                <span className="material-symbols-outlined text-sm font-bold animate-pulse">radio_button_checked</span>
                <span className="text-xs font-bold uppercase tracking-wider">Đấu giá trực tiếp</span>
              </div>

              <h1 className="text-slate-900 text-4xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Trải nghiệm Đấu giá <span className="text-primary">Realtime</span> Chưa từng có.
              </h1>

              <p className="text-slate-500 text-lg lg:text-xl max-w-lg leading-relaxed">
                Tham gia cùng hàng nghìn người dùng trong các đấu giá trực tiếp thú vị. An toàn, nhanh chóng và minh bạch.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button variant="primary" className="px-8 py-4 text-base shadow-lg shadow-primary/25">
                      <span className="material-symbols-outlined">dashboard</span>
                      Đến Bảng điều khiển
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button variant="primary" className="px-8 py-4 text-base shadow-lg shadow-primary/25">
                        Bắt đầu ngay
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="px-8 py-4 text-base"
                      onClick={scrollToFeatures}
                    >
                      Tìm hiểu thêm
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Hero Stats Card */}
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-2xl p-10 shadow-2xl border border-slate-200">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: '12.4k+', label: 'Người dùng', icon: 'groups', color: 'text-primary' },
                    { value: '150ms', label: 'Độ trễ', icon: 'speed', color: 'text-amber-500' },
                    { value: '99.9%', label: 'Uptime', icon: 'verified', color: 'text-emerald-500' },
                    { value: '24/7', label: 'Hỗ trợ', icon: 'support_agent', color: 'text-primary' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-4">
                      <span className={`material-symbols-outlined text-3xl ${stat.color} mb-3`}>{stat.icon}</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="relative border-y border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex overflow-x-auto gap-8 py-6 no-scrollbar">
            {[
              { icon: 'groups', text: '12.4k Người đấu giá', color: 'text-primary' },
              { icon: 'verified', text: 'Giao dịch bảo hiểm', color: 'text-emerald-500' },
              { icon: 'speed', text: '150ms Độ trễ', color: 'text-amber-500' },
              { icon: 'lock', text: 'Escrow an toàn', color: 'text-primary' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Section
        id="features"
        title="Tại sao chọn nền tảng của chúng tôi"
        subtitle="Mọi thứ bạn cần cho trải nghiệm đấu giá tuyệt vời"
        className="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Section>

      {/* How It Works Section */}
      <Section
        title="Cách hoạt động"
        subtitle="Bắt đầu chỉ với vài bước đơn giản"
        className="bg-slate-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25 group-hover:shadow-glow transition-all duration-300 group-hover:-translate-y-1">
                  <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-soft hidden lg:flex">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" style={{ width: 'calc(100% - 4rem)' }} />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-dark py-20 lg:py-28">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
            <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-blue-400 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative max-w-3xl mx-auto text-center px-6">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Sẵn sàng bắt đầu đấu giá?
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Tham gia nền tảng của chúng tôi ngay hôm nay và khám phá những món đồ tuyệt vời trong các đấu giá realtime.
            </p>
            {!isAuthenticated && (
              <Link to="/register">
                <Button variant="primary" className="px-10 py-4 text-base bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Tạo tài khoản miễn phí
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button variant="primary" className="px-10 py-4 text-base bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                  <span className="material-symbols-outlined">dashboard</span>
                  Đến Bảng điều khiển
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
