import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, ShoppingCart, CreditCard, Package, Shield, UserCircle, Store, Mail, Phone, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    {
      icon: ShoppingCart,
      title: 'Đặt hàng',
      color: 'bg-blue-100 text-blue-600',
      count: 15
    },
    {
      icon: CreditCard,
      title: 'Thanh toán',
      color: 'bg-green-100 text-green-600',
      count: 12
    },
    {
      icon: Package,
      title: 'Giao hàng',
      color: 'bg-orange-100 text-orange-600',
      count: 18
    },
    {
      icon: Shield,
      title: 'Đổi trả & Hoàn tiền',
      color: 'bg-red-100 text-red-600',
      count: 10
    },
    {
      icon: UserCircle,
      title: 'Tài khoản',
      color: 'bg-purple-100 text-purple-600',
      count: 8
    },
    {
      icon: Store,
      title: 'Người bán',
      color: 'bg-yellow-100 text-yellow-600',
      count: 14
    }
  ];

  const faqs = [
    {
      category: 'Đặt hàng',
      questions: [
        {
          question: 'Làm thế nào để đặt hàng?',
          answer: 'Để đặt hàng, bạn chỉ cần: 1) Tìm sản phẩm muốn mua, 2) Thêm vào giỏ hàng, 3) Chọn "Thanh toán", 4) Nhập thông tin giao hàng và phương thức thanh toán, 5) Xác nhận đơn hàng. Bạn sẽ nhận được email xác nhận sau khi đặt hàng thành công.'
        },
        {
          question: 'Tôi có thể hủy đơn hàng không?',
          answer: 'Có, bạn có thể hủy đơn hàng miễn phí trước khi người bán xác nhận đơn. Vào "Đơn hàng của tôi", chọn đơn cần hủy và nhấn "Hủy đơn hàng". Sau khi người bán đã xác nhận, bạn cần liên hệ trực tiếp với người bán để hủy.'
        },
        {
          question: 'Làm sao để theo dõi đơn hàng?',
          answer: 'Bạn có thể theo dõi đơn hàng bằng cách: 1) Đăng nhập tài khoản, 2) Vào "Đơn hàng của tôi", 3) Chọn đơn hàng muốn xem. Tại đây bạn sẽ thấy trạng thái chi tiết và mã vận đơn (nếu có) để tra cứu.'
        },
        {
          question: 'Tôi có thể đổi địa chỉ giao hàng sau khi đặt không?',
          answer: 'Nếu đơn hàng chưa được giao cho đơn vị vận chuyển, bạn có thể liên hệ người bán để thay đổi địa chỉ. Nếu đã giao cho shipper, bạn cần liên hệ trực tiếp hotline của đơn vị vận chuyển.'
        }
      ]
    },
    {
      category: 'Thanh toán',
      questions: [
        {
          question: 'Có những hình thức thanh toán nào?',
          answer: 'Chúng tôi hỗ trợ nhiều hình thức: 1) COD (Thanh toán khi nhận hàng), 2) Thẻ ATM/Internet Banking, 3) Thẻ tín dụng/ghi nợ Visa, Mastercard, JCB, 4) Ví điện tử (MoMo, ZaloPay, ShopeePay), 5) Chuyển khoản ngân hàng.'
        },
        {
          question: 'Thanh toán online có an toàn không?',
          answer: 'Có, hoàn toàn an toàn. Chúng tôi sử dụng công nghệ mã hóa SSL 256-bit và tuân thủ tiêu chuẩn PCI DSS. Thông tin thẻ của bạn không được lưu trữ trên hệ thống của chúng tôi và được xử lý trực tiếp bởi các cổng thanh toán uy tín.'
        },
        {
          question: 'Tại sao thanh toán của tôi bị từ chối?',
          answer: 'Có nhiều nguyên nhân: 1) Số dư không đủ, 2) Thẻ đã hết hạn hoặc bị khóa, 3) Thông tin thẻ nhập sai, 4) Ngân hàng từ chối giao dịch do nghi ngờ gian lận. Hãy kiểm tra lại hoặc thử phương thức thanh toán khác. Nếu vẫn lỗi, liên hệ ngân hàng của bạn.'
        }
      ]
    },
    {
      category: 'Giao hàng',
      questions: [
        {
          question: 'Thời gian giao hàng là bao lâu?',
          answer: 'Thời gian giao hàng phụ thuộc vào vị trí: 1) Nội thành HN, HCM: 1-3 ngày, 2) Tỉnh thành khác: 3-5 ngày, 3) Vùng xa: 5-7 ngày. Thời gian có thể lâu hơn vào dịp lễ, Tết hoặc do thời tiết.'
        },
        {
          question: 'Phí vận chuyển được tính như thế nào?',
          answer: 'Phí vận chuyển phụ thuộc vào: 1) Khoảng cách giao hàng, 2) Khối lượng và kích thước sản phẩm, 3) Người bán có áp dụng miễn phí ship không. Phí chính xác sẽ hiển thị khi bạn thanh toán. Đơn hàng từ 99k thường được miễn phí ship.'
        },
        {
          question: 'Tôi không có nhà khi shipper đến giao?',
          answer: 'Shipper sẽ liên hệ bạn trước khi giao. Nếu bạn không có nhà, bạn có thể: 1) Hẹn lại thời gian giao hàng, 2) Nhờ người thân nhận thay, 3) Nhận tại bưu cục gần nhất. Lưu ý: Một số đơn vị giao tối đa 3 lần.'
        }
      ]
    },
    {
      category: 'Đổi trả & Hoàn tiền',
      questions: [
        {
          question: 'Chính sách đổi trả là gì?',
          answer: 'Bạn có thể đổi/trả hàng trong vòng 7 ngày kể từ khi nhận hàng nếu: 1) Sản phẩm lỗi, hư hỏng, 2) Không đúng mô tả, 3) Thiếu phụ kiện. Điều kiện: Sản phẩm chưa qua sử dụng, còn nguyên tem mác, hóa đơn.'
        },
        {
          question: 'Làm thế nào để yêu cầu hoàn tiền?',
          answer: 'Vào "Đơn hàng của tôi", chọn đơn cần hoàn tiền, nhấn "Yêu cầu trả hàng/hoàn tiền", chọn lý do và upload ảnh chụp (nếu có). Người bán sẽ xem xét trong 24-48h. Sau khi chấp nhận, tiền sẽ hoàn về trong 5-10 ngày làm việc.'
        },
        {
          question: 'Tôi nhận được sản phẩm bị lỗi, phải làm sao?',
          answer: 'Đừng lo! Hãy: 1) Chụp ảnh/video sản phẩm lỗi, 2) Liên hệ người bán hoặc tạo yêu cầu trả hàng ngay, 3) Mô tả chi tiết lỗi và đính kèm hình ảnh. Chúng tôi sẽ hỗ trợ bạn đổi sản phẩm mới hoặc hoàn tiền 100%.'
        }
      ]
    },
    {
      category: 'Tài khoản',
      questions: [
        {
          question: 'Làm sao để đăng ký tài khoản?',
          answer: 'Rất đơn giản: 1) Nhấn "Đăng ký" ở góc trên, 2) Nhập số điện thoại/email, 3) Nhận mã OTP, 4) Nhập mã và tạo mật khẩu. Bạn cũng có thể đăng ký nhanh qua Facebook hoặc Google.'
        },
        {
          question: 'Quên mật khẩu phải làm sao?',
          answer: 'Tại trang đăng nhập, chọn "Quên mật khẩu", nhập email/SĐT đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu qua email hoặc mã OTP qua SMS. Làm theo hướng dẫn để tạo mật khẩu mới.'
        },
        {
          question: 'Làm sao để bảo mật tài khoản?',
          answer: 'Để bảo vệ tài khoản: 1) Dùng mật khẩu mạnh và không chia sẻ, 2) Bật xác thực 2 bước, 3) Không đăng nhập trên máy lạ, 4) Thường xuyên đổi mật khẩu, 5) Cảnh giác với email/tin nhắn lừa đảo.'
        }
      ]
    },
    {
      category: 'Người bán',
      questions: [
        {
          question: 'Làm thế nào để trở thành người bán?',
          answer: 'Để bán hàng trên nền tảng: 1) Đăng ký tài khoản người bán, 2) Cung cấp thông tin CCCD/GPKD, 3) Thiết lập gian hàng, 4) Đăng sản phẩm và bắt đầu bán. Quy trình duyệt mất 2-3 ngày làm việc.'
        },
        {
          question: 'Phí bán hàng là bao nhiêu?',
          answer: 'Chúng tôi thu: 1) Phí hoa hồng từ 3-8% trên mỗi đơn hàng tùy danh mục, 2) Phí dịch vụ thanh toán online 1.5%, 3) Phí quảng cáo (tùy chọn). Không có phí đăng ký ban đầu hoặc phí hàng tháng.'
        },
        {
          question: 'Khi nào tôi nhận được tiền bán hàng?',
          answer: 'Sau khi khách nhận hàng và xác nhận hoặc sau 7 ngày (tự động), tiền sẽ về số dư tài khoản người bán. Bạn có thể rút tiền về ngân hàng, thời gian xử lý 1-3 ngày làm việc.'
        }
      ]
    }
  ];

  const filteredFaqs = searchTerm
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-shopee-orange to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Trung tâm trợ giúp</h1>
            <p className="text-lg opacity-90 mb-8">Chúng tôi có thể giúp gì cho bạn?</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 w-full bg-white text-gray-900 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Chủ đề phổ biến</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${category.color} mb-3`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.title}</h3>
                <p className="text-xs text-gray-500">{category.count} bài viết</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Câu hỏi thường gặp</h2>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-shopee-orange rounded"></div>
                    {category.category}
                  </h3>
                  
                  <div className="space-y-3">
                    {category.questions.map((faq, questionIndex) => {
                      const isOpen = openFaq === `${categoryIndex}-${questionIndex}`;
                      return (
                        <div
                          key={questionIndex}
                          className="bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900 text-left">{faq.question}</span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4 text-gray-700 border-t">
                              <p className="pt-4">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Contact */}
      <div className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vẫn cần hỗ trợ?</h2>
          <p className="text-gray-600 mb-8">Đừng ngại liên hệ với chúng tôi, chúng tôi luôn sẵn sàng hỗ trợ!</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/contact"
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Gửi email</h3>
              <p className="text-sm text-gray-600">support@shopvn.com</p>
            </a>

            <a
              href="tel:1900xxxx"
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
              <p className="text-sm text-gray-600">1900-xxxx (Miễn phí)</p>
            </a>

            <div className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">Trò chuyện trực tuyến</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

