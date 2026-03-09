import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Đấu giá Realtime - Nền tảng đấu giá trực tuyến</title>
        <meta name="description" content="Trải nghiệm đấu giá trực tiếp với cập nhật giá đấu tức thì. Đăng ký, tham gia đấu giá và mua bán an toàn." />
      </Helmet>
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-background-secondary to-background pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Trải nghiệm Đấu giá Realtime
            <span className="text-primary-blue"> Chưa từng có</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người dùng trong các đấu giá trực tiếp thú vị. Đấu giá realtime, thắng những món đồ tuyệt vời và tận hưởng trải nghiệm an toàn, mượt mà.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/auctions">
                <Button variant="primary" className="px-8 py-3 text-lg">
                  Đến Bảng điều khiển
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" className="px-8 py-3 text-lg">
                    Bắt đầu
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="px-8 py-3 text-lg"
                  onClick={scrollToFeatures}
                >
                  Tìm hiểu thêm
                </Button>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* Features Preview Section */}
      <Section
        id="features"
        title="Tại sao chọn nền tảng của chúng tôi"
        subtitle="Mọi thứ bạn cần cho trải nghiệm đấu giá tuyệt vời"
        className="bg-background"
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
        className="bg-background-secondary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary-blue transform translate-x-4" style={{ width: 'calc(100% - 2rem)' }} />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-primary-blue text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu đấu giá?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia nền tảng của chúng tôi ngay hôm nay và khám phá những món đồ tuyệt vời trong các đấu giá realtime.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button variant="secondary" className="px-8 py-3 text-lg bg-white text-primary-blue hover:bg-gray-100">
                Tạo tài khoản của bạn
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/auctions">
              <Button variant="secondary" className="px-8 py-3 text-lg bg-white text-primary-blue hover:bg-gray-100">
                Đến Bảng điều khiển
              </Button>
            </Link>
          )}
        </div>
      </Section>
    </div>
  );
};

export default Home;
