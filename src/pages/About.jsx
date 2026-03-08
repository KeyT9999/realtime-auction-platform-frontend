import Section from '../components/common/Section';
import Card from '../components/common/Card';
import FeatureCard from '../components/common/FeatureCard';

const About = () => {
  const values = [
    { icon: '🤝', title: 'Tin cậy', description: 'Chúng tôi ưu tiên bảo mật và minh bạch trong mọi giao dịch.' },
    { icon: '🔍', title: 'Minh bạch', description: 'Quy trình rõ ràng và giao tiếp trung thực với người dùng.' },
    { icon: '💡', title: 'Đổi mới', description: 'Liên tục cải tiến nền tảng với công nghệ tiên tiến nhất.' },
    { icon: '👤', title: 'Người dùng là trung tâm', description: 'Trải nghiệm và sự hài lòng của bạn là cốt lõi.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-1/3 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
        </div>
        <div className="relative section-container pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="badge-primary mb-6 mx-auto">Về chúng tôi</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Giới thiệu về <span className="text-primary">Vela Auction</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Chúng tôi xây dựng tương lai của đấu giá trực tuyến với công nghệ realtime và thiết kế trải nghiệm người dùng.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <Section title="Sứ mệnh của chúng tôi" className="bg-white">
        <Card hover={false} className="max-w-4xl mx-auto p-8 lg:p-12">
          <p className="text-lg text-slate-500 leading-relaxed mb-4">
            Sứ mệnh của chúng tôi là cung cấp một nền tảng đấu giá an toàn, thú vị và dễ tiếp cận, kết nối người mua và người bán trong thời gian thực. Chúng tôi tin rằng mọi người đều nên được trải nghiệm đấu giá công bằng và minh bạch.
          </p>
          <p className="text-lg text-slate-500 leading-relaxed">
            Kết hợp công nghệ tiên tiến với thiết kế thân thiện, nền tảng của chúng tôi vừa mạnh mẽ vừa dễ sử dụng.
          </p>
        </Card>
      </Section>

      {/* Story */}
      <Section title="Câu chuyện của chúng tôi" className="bg-slate-50">
        <Card hover={false} className="max-w-4xl mx-auto p-8 lg:p-12">
          <p className="text-lg text-slate-500 leading-relaxed mb-4">
            Vela Auction ra đời từ tầm nhìn cách mạng hóa trải nghiệm đấu giá trực tuyến. Chúng tôi nhận ra rằng các nền tảng đấu giá truyền thống thiếu tính tương tác realtime và trải nghiệm người dùng hiện đại.
          </p>
          <p className="text-lg text-slate-500 leading-relaxed">
            Với đội ngũ đam mê công nghệ và trải nghiệm người dùng, chúng tôi xây dựng nền tảng kết hợp sự hấp dẫn của đấu giá trực tiếp với sự tiện lợi của nền tảng online.
          </p>
        </Card>
      </Section>

      {/* Values */}
      <Section title="Giá trị cốt lõi" subtitle="Những nguyên tắc định hướng mọi hoạt động" className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <FeatureCard key={index} icon={value.icon} title={value.title} description={value.description} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default About;
