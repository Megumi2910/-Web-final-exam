import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button, Input } from '../components/ui';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: 'Hotline',
      details: ['1900-xxxx (Miễn phí)', '028-xxxx-xxxx'],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@shopvn.com', 'info@shopvn.com'],
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      details: ['123 Nguyễn Huệ, Q.1', 'TP. Hồ Chí Minh'],
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      details: ['T2-T6: 8:00 - 18:00', 'T7-CN: 9:00 - 17:00'],
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const faqTopics = [
    {
      title: 'Đơn hàng & Giao hàng',
      questions: [
        'Làm thế nào để theo dõi đơn hàng?',
        'Thời gian giao hàng là bao lâu?',
        'Phí vận chuyển được tính như thế nào?'
      ]
    },
    {
      title: 'Thanh toán',
      questions: [
        'Có những hình thức thanh toán nào?',
        'Thanh toán có an toàn không?',
        'Làm sao để được hoàn tiền?'
      ]
    },
    {
      title: 'Tài khoản',
      questions: [
        'Cách đăng ký tài khoản mới?',
        'Quên mật khẩu phải làm sao?',
        'Cách cập nhật thông tin cá nhân?'
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-shopee-orange to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg opacity-90">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${info.color} mb-4`}>
                  <info.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi tin nhắn cho chúng tôi</h2>
                <p className="text-gray-600">Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất</p>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-600 text-5xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Gửi thành công!</h3>
                  <p className="text-green-700">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="order">Vấn đề về đơn hàng</option>
                      <option value="payment">Vấn đề thanh toán</option>
                      <option value="product">Thắc mắc về sản phẩm</option>
                      <option value="account">Vấn đề tài khoản</option>
                      <option value="seller">Đăng ký người bán</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Nhập nội dung chi tiết..."
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-shopee-orange resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full shopee-gradient flex items-center justify-center gap-2"
                    size="lg"
                  >
                    <Send className="w-5 h-5" />
                    Gửi tin nhắn
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ Quick Links */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Câu hỏi thường gặp</h2>
                <p className="text-gray-600">Có thể câu trả lời bạn cần đã có sẵn đây</p>
              </div>

              <div className="space-y-4">
                {faqTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-shopee-orange" />
                      {topic.title}
                    </h3>
                    <ul className="space-y-2">
                      {topic.questions.map((question, idx) => (
                        <li key={idx}>
                          <a 
                            href="/help" 
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            • {question}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">💬 Chat trực tuyến</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Cần hỗ trợ ngay? Chat với chúng tôi!
                </p>
                <Button variant="outline" className="w-full border-shopee-orange text-shopee-orange hover:bg-shopee-orange hover:text-white">
                  Bắt đầu chat ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vị trí của chúng tôi</h2>
            <p className="text-gray-600">Ghé thăm văn phòng chúng tôi tại TP. Hồ Chí Minh</p>
          </div>
          
          <div className="bg-gray-300 rounded-lg overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">Bản đồ sẽ được tích hợp tại đây</p>
              <p className="text-sm mt-2">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

