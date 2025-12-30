import React from 'react';
import { Users, ShoppingBag, Store, Award, Heart, TrendingUp, Shield, Sparkles } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { icon: Users, label: 'Người dùng', value: '10M+', color: 'text-blue-500' },
    { icon: Store, label: 'Nhà bán hàng', value: '500K+', color: 'text-green-500' },
    { icon: ShoppingBag, label: 'Đơn hàng/ngày', value: '1M+', color: 'text-purple-500' },
    { icon: Award, label: 'Đánh giá 5 sao', value: '95%', color: 'text-yellow-500' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Khách hàng là trung tâm',
      description: 'Chúng tôi đặt lợi ích và trải nghiệm của khách hàng lên hàng đầu trong mọi quyết định.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Shield,
      title: 'Bảo vệ người mua',
      description: 'Cam kết hoàn tiền 100% nếu sản phẩm không đúng mô tả hoặc có vấn đề.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Phát triển bền vững',
      description: 'Xây dựng nền tảng thương mại điện tử phát triển bền vững, tạo giá trị cho cộng đồng.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Sparkles,
      title: 'Đổi mới sáng tạo',
      description: 'Không ngừng cải tiến công nghệ để mang đến trải nghiệm mua sắm tốt nhất.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const milestones = [
    { year: '2015', title: 'Thành lập', description: 'Khởi đầu với đội ngũ 10 người' },
    { year: '2017', title: 'Mở rộng', description: 'Đạt 1 triệu người dùng' },
    { year: '2019', title: 'Phát triển', description: '100K nhà bán hàng tham gia' },
    { year: '2021', title: 'Bứt phá', description: '5 triệu đơn hàng/tháng' },
    { year: '2023', title: 'Dẫn đầu', description: 'Top 1 sàn TMĐT Việt Nam' },
    { year: '2025', title: 'Hiện tại', description: '10M+ người dùng tin tưởng' }
  ];

  const team = [
    {
      name: 'Nguyễn Hàm Ngô',
      role: 'CEO & Founder',
      image: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg',
      description: 'Founder với 15 năm kinh nghiệm trong lĩnh vực TMĐT'
    },
    {
      name: 'Ngô Quang Minh',
      role: 'CTO',
      image: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg',
      description: 'Chuyên gia công nghệ hàng đầu với background từ Silicon Valley'
    },
    {
      name: 'Cát Minh Khoa',
      role: 'CMO',
      image: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg',
      description: 'Marketing leader với nhiều chiến dịch thành công'
    },
    {
      name: 'Nguyễn Quốc Bảo',
      role: 'COO',
      image: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg',
      description: 'Chuyên gia vận hành với kinh nghiệm quốc tế'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-shopee-orange to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Về chúng tôi</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, kết nối hàng triệu người mua và người bán
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Được thành lập vào năm 2015, chúng tôi bắt đầu với một ý tưởng đơn giản: 
                  làm cho việc mua sắm trực tuyến trở nên dễ dàng, an toàn và thú vị hơn cho 
                  tất cả mọi người tại Việt Nam.
                </p>
                <p>
                  Từ một startup nhỏ với chỉ 10 nhân viên, chúng tôi đã phát triển thành nền tảng 
                  thương mại điện tử hàng đầu với hơn 10 triệu người dùng và 500,000 nhà bán hàng.
                </p>
                <p>
                  Hành trình của chúng tôi được thúc đẩy bởi niềm đam mê phục vụ khách hàng và 
                  không ngừng đổi mới. Chúng tôi tin rằng công nghệ có thể tạo ra những trải nghiệm 
                  mua sắm tuyệt vời và kết nối cộng đồng.
                </p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Our Team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị định hướng mọi hành động của chúng tôi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${value.color} mb-4`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hành trình phát triển</h2>
            <p className="text-gray-600">Những cột mốc quan trọng trong 10 năm qua</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-shopee-orange/20"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                      <div className="text-shopee-orange font-bold text-2xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-shopee-orange rounded-full border-4 border-white shadow-md z-10"></div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ lãnh đạo</h2>
            <p className="text-gray-600">Những người dẫn dắt công ty phát triển</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-shopee-orange font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-shopee-orange to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi</h2>
          <p className="text-xl opacity-90 mb-8">
            Trở thành một phần của cộng đồng mua sắm lớn nhất Việt Nam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-shopee-orange px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Đăng ký ngay
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Trở thành người bán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

