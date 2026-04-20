// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Home.
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

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
      title: 'Tạo tài khoản',
      description: 'Đăng ký trong vài giây với email hoặc tài khoản Google. Xác thực email để bắt đầu.',
    },
    {
      number: '2',
      title: 'Duyệt đấu giá',
      description: 'Khám phá các đấu giá đang diễn ra, lọc theo danh mục và tìm các món đồ bạn yêu thích.',
    },
    {
      number: '3',
      title: 'Đặt giá đấu',
      description: 'Tham gia đấu giá realtime với cập nhật tức thì và thông báo.',
    },
    {
      number: '4',
      title: 'Thắng & Hoàn tất',
      description: 'Nếu bạn thắng, hoàn tất giao dịch an toàn và nhận hàng của bạn.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Helmet>
        <title>Đấu giá Realtime - Nền tảng đấu giá trực tuyến</title>
        <meta name="description" content="Trải nghiệm đấu giá trực tiếp với cập nhật giá đấu tức thì. Đăng ký, tham gia đấu giá và mua bán an toàn." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[360px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="text-center max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Trải nghiệm Đấu giá Realtime
            <span className="text-primary-blue"> Chưa từng có</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người dùng trong các đấu giá trực tiếp thú vị. Đấu giá realtime, thắng những món đồ tuyệt vời và tận hưởng trải nghiệm an toàn, mượt mà.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/auctions">
                <Button variant="primary" className="px-8 py-3 text-lg shadow-amber-500/25">
                  Đến Bảng điều khiển
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" className="px-8 py-3 text-lg shadow-amber-500/25">
                    Bắt đầu
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="px-8 py-3 text-lg !bg-slate-900 !border-slate-700 !text-slate-100 hover:!border-amber-500/50 hover:!text-amber-400"
                  onClick={scrollToFeatures}
                >
                  Tìm hiểu thêm
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tại sao chọn nền tảng của chúng tôi</h2>
          <p className="text-lg text-slate-400 leading-relaxed">Mọi thứ bạn cần cho trải nghiệm đấu giá tuyệt vời</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="group bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl hover:bg-slate-800/80 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cách hoạt động</h2>
            <p className="text-lg text-slate-400 leading-relaxed">Bắt đầu chỉ với vài bước đơn giản</p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-amber-500/50 transform translate-x-4" style={{ width: 'calc(100% - 2rem)' }} />
              )}
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Sẵn sàng bắt đầu đấu giá?
          </h2>
          <p className="text-xl mb-8 text-slate-400">
            Tham gia nền tảng của chúng tôi ngay hôm nay và khám phá những món đồ tuyệt vời trong các đấu giá realtime.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button variant="primary" className="px-8 py-3 text-lg shadow-amber-500/25">
                Tạo tài khoản của bạn
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/auctions">
              <Button variant="primary" className="px-8 py-3 text-lg shadow-amber-500/25">
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
