import React, { useState } from 'react';
import { 
  CreditCard,
  User,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/settings/ProfileSettings';
import GeneralSettings from '../../components/settings/GeneralSettings';

const CustomerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'general', label: 'Cài đặt chung', icon: SettingsIcon },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard }
  ];



  const renderProfileTab = () => (
    <ProfileSettings showAddress={true} />
  );

  const renderGeneralTab = () => (
    <GeneralSettings />
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
        <p className="text-sm text-gray-500 mb-6">
          Quản lý các phương thức thanh toán của bạn. Tính năng này sẽ sớm được triển khai.
        </p>
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý cài đặt tài khoản và tùy chọn của bạn
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'payment' && renderPaymentTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;

