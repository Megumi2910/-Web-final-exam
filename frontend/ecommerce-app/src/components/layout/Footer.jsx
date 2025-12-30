import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Về CNVLTW</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-white">Giới thiệu về chúng tôi</Link></li>
              <li><Link to="/categories" className="hover:text-white">Danh mục sản phẩm</Link></li>
              <li><Link to="/flash-sale" className="hover:text-white">Flash Sale</Link></li>
              <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/help" className="hover:text-white">Trung tâm trợ giúp</Link></li>
              <li><Link to="/search" className="hover:text-white">Tìm kiếm sản phẩm</Link></li>
              <li><Link to="/cart" className="hover:text-white">Giỏ hàng</Link></li>
              <li><Link to="/customer/orders" className="hover:text-white">Đơn hàng của tôi</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white">Trang chủ</Link></li>
              <li><Link to="/customer/dashboard" className="hover:text-white">Tài khoản của tôi</Link></li>
              <li><Link to="/customer/wishlist" className="hover:text-white">Yêu thích</Link></li>
              <li><Link to="/seller" className="hover:text-white">Kênh người bán</Link></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a href="tel:19001234" className="hover:text-white">1900 1234</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@cnvltw.com" className="hover:text-white">support@cnvltw.com</a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
            </div>

            {/* Social media */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Theo dõi chúng tôi</h4>
              <div className="flex space-x-3">
                <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://youtube.com" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 CNVLTW. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white">Về chúng tôi</Link>
              <Link to="/help" className="hover:text-white">Trợ giúp</Link>
              <Link to="/contact" className="hover:text-white">Liên hệ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
