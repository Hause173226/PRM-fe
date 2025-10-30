import React, { useState } from 'react';
import { User, Heart, Clock, Edit, Star, MessageSquare, Package, Shield } from 'lucide-react';
import { mockUser, mockVehicles, mockTransactions } from '../data/mockData';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state

  const userListings = mockVehicles.filter(v => v.sellerId === mockUser.id);
  const userTransactions = mockTransactions.filter(t => t.buyerId === mockUser.id);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đăng nhập tài khoản
            </h1>
            <p className="text-gray-600">
              Đăng nhập để quản lý tin đăng và giao dịch
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email hoặc số điện thoại
              </label>
              <input
                type="text"
                placeholder="Nhập email hoặc số điện thoại"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button className="text-blue-600 hover:underline">
                Đăng ký ngay
              </button>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-600 mb-3">Hoặc đăng nhập bằng</p>
            <div className="space-y-2">
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                Google
              </button>
              <button className="w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition-colors">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Hồ sơ', icon: User },
    { id: 'listings', name: 'Tin đăng', icon: Package },
    { id: 'favorites', name: 'Yêu thích', icon: Heart },
    { id: 'transactions', name: 'Giao dịch', icon: Clock }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {mockUser.name.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{mockUser.name}</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> {mockUser.email}</p>
                    <p><strong>Số điện thoại:</strong> {mockUser.phone}</p>
                    <p><strong>Ngày tham gia:</strong> {new Date(mockUser.joinDate).toLocaleDateString('vi-VN')}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span><strong>Đánh giá:</strong> {mockUser.rating}/5</span>
                      <span className="text-sm">({mockUser.totalTransactions} giao dịch)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{userListings.length}</h3>
                <p className="text-gray-600">Tin đăng</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{userTransactions.length}</h3>
                <p className="text-gray-600">Giao dịch</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{mockUser.rating}</h3>
                <p className="text-gray-600">Đánh giá trung bình</p>
              </div>
            </div>
          </div>
        );

      case 'listings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tin đăng của tôi</h2>
              <span className="text-sm text-gray-600">
                {userListings.length} tin đăng
              </span>
            </div>

            {userListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Bạn chưa có tin đăng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 flex items-center space-x-4">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-20 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-blue-600 font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(listing.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Đăng ngày {new Date(listing.postedDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'available' ? 'bg-green-100 text-green-800' :
                        listing.status === 'sold' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {listing.status === 'available' ? 'Đang bán' :
                         listing.status === 'sold' ? 'Đã bán' : 'Đang xử lý'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Sản phẩm yêu thích</h2>
            </div>

            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có sản phẩm yêu thích</p>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>
            </div>

            {userTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{transaction.vehicleTitle}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Hoàn thành' :
                         transaction.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Giá trị:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}</p>
                      <p><strong>Phương thức:</strong> {transaction.paymentMethod}</p>
                      <p><strong>Ngày giao dịch:</strong> {new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tài khoản của tôi</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và hoạt động</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;