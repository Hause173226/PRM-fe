import React, { useEffect, useState } from "react";
import {
  User,
  Heart,
  Clock,
  Edit,
  Star,
  Package,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { mockUser, mockTransactions } from "../data/mockData";
import { getProfile, updateProfile, UpdateProfilePayload } from "../services/userService";
import {
  getMyProducts,
  Product as ProductType,
} from "../services/productService";
import {
  getBuyerOrders,
  getSellerOrders,
  Order,
} from "../services/orderService";
import { getChats, Chat } from "../services/chatservice";
import { getWalletByUser, WalletInfo } from "../services/walletService";
import { createZaloPayUrl } from "../services/paymentService";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductById } from "../services/productService";
import { getUserById } from "../services/userService";

type Profile = {
  id: string;
  email: string;
  fullName: string;
  displayName: string | null;
  phone: string;
  avatarUrl: string;
  address: string;
  role: string;
  isActive: boolean;
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  // const [loading, setLoading] = useState(true);
  const [userListings, setUserListings] = useState<ProductType[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    displayName: "",
    phone: "",
    avatarUrl: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBuyerOrders()
      .then(setBuyerOrders)
      .catch(() => setBuyerOrders([]));

    getSellerOrders()
      .then(setSellerOrders)
      .catch(() => setSellerOrders([]));
  }, []);

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      // Khởi tạo dữ liệu form chỉnh sửa
      setEditFormData({
        fullName: data.fullName || "",
        displayName: data.displayName || "",
        phone: data.phone || "",
        avatarUrl: data.avatarUrl || "",
        address: data.address || "",
      });
    });
    // .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;
    getMyProducts()
      .then((data) => {
        if (!mounted) return;
        setUserListings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching my products:", err);
        setUserListings([]);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Xử lý upload ảnh
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Convert to base64 or upload to server
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Option 1: Send base64 directly to API (if API supports)
        // Option 2: Upload to image hosting service first, then get URL
        
        // For now, we'll use the base64 as avatarUrl (you may need to change this based on your API)
        if (profile?.id) {
          const payload: UpdateProfilePayload = {
            fullName: profile.fullName,
            phone: profile.phone,
            address: profile.address,
            displayName: profile.displayName || undefined,
            avatarUrl: base64String, // Use base64 or upload URL
          };

          console.log("Updating avatar...");
          const updatedProfile = await updateProfile(profile.id, payload);
          setProfile(updatedProfile);
          
          alert('Cập nhật ảnh đại diện thành công!');
        }
      };
      
      reader.readAsDataURL(file);
      
    } catch (err: any) {
      console.error("Upload image error", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi upload ảnh";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Xử lý inline edit cho từng field
  const handleInlineEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSaveField = async (field: string) => {
    if (!profile?.id) {
      alert("Không tìm thấy thông tin người dùng");
      return;
    }

    // Validate theo từng field
    if (field === "fullName" && !tempValue.trim()) {
      alert("Họ tên không được để trống");
      return;
    }

    if (field === "phone") {
      if (!tempValue.trim()) {
        alert("Số điện thoại không được để trống");
        return;
      }
      if (!/^[0-9]{10,11}$/.test(tempValue.trim())) {
        alert("Số điện thoại không hợp lệ (10-11 chữ số)");
        return;
      }
    }

    if (field === "address" && !tempValue.trim()) {
      alert("Địa chỉ không được để trống");
      return;
    }

    try {
      setEditLoading(true);
      
      const payload: UpdateProfilePayload = {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        displayName: profile.displayName || undefined,
        avatarUrl: profile.avatarUrl || undefined,
        [field]: tempValue.trim() || undefined,
      };

      console.log("Updating field:", field, "with value:", tempValue.trim());
      const updatedProfile = await updateProfile(profile.id, payload);
      console.log("Updated profile response:", updatedProfile);
      
      setProfile(updatedProfile);
      setEditingField(null);
      setTempValue("");
      
    } catch (err: any) {
      console.error("Edit field error", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi cập nhật thông tin";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleEditProfile = async () => {
    if (!profile?.id) {
      alert("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!editFormData.fullName.trim()) {
      alert("Vui lòng nhập họ tên");
      return;
    }

    if (!editFormData.phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(editFormData.phone.trim())) {
      alert("Số điện thoại không hợp lệ (10-11 chữ số)");
      return;
    }

    if (!editFormData.address.trim()) {
      alert("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      setEditLoading(true);
      
      const payload: UpdateProfilePayload = {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
      };

      // Chỉ thêm các trường optional nếu có giá trị
      if (editFormData.displayName && editFormData.displayName.trim()) {
        payload.displayName = editFormData.displayName.trim();
      }
      
      if (editFormData.avatarUrl && editFormData.avatarUrl.trim()) {
        payload.avatarUrl = editFormData.avatarUrl.trim();
      }

      console.log("Updating profile with payload:", payload);
      const updatedProfile = await updateProfile(profile.id, payload);
      console.log("Updated profile response:", updatedProfile);
      
      // Cập nhật lại profile state
      setProfile(updatedProfile);
      
      // Cập nhật lại form data với dữ liệu mới
      setEditFormData({
        fullName: updatedProfile.fullName || "",
        displayName: updatedProfile.displayName || "",
        phone: updatedProfile.phone || "",
        avatarUrl: updatedProfile.avatarUrl || "",
        address: updatedProfile.address || "",
      });
      
      alert("Cập nhật thông tin thành công!");
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Edit profile error", err);
      console.error("Error response:", err.response);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi cập nhật thông tin. Vui lòng thử lại.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Xử lý nạp tiền qua ZaloPay
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10,000 VND");
      return;
    }

    try {
      setTopUpLoading(true);
      const description = `Nạp ${formatCurrency(amount)} vào ví`;

      // Gọi API ZaloPay
      const resp = await createZaloPayUrl({
        amount: Math.ceil(amount),
        description,
      });

      // Kiểm tra returncode từ ZaloPay
      if (resp.returncode === "1" && resp.orderUrl) {
        // Success - chuyển hướng đến trang thanh toán ZaloPay
        window.location.href = resp.orderUrl;
      } else {
        // Failed hoặc không có orderUrl
        const errorMsg = resp.returnmessage || "Không tạo được đường dẫn thanh toán";
        console.error("ZaloPay error:", resp);
        alert(`Lỗi: ${errorMsg}. Vui lòng thử lại.`);
      }
    } catch (err) {
      console.error("Top-up error", err);
      alert("Lỗi khi tạo liên kết nạp tiền. Vui lòng thử lại.");
    } finally {
      setTopUpLoading(false);
    }
  };
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Tự động mở tab wallet nếu được chuyển hướng từ trang đặt hàng
  useEffect(() => {
    const state = location.state as { openTab?: string };
    if (state?.openTab === "wallet") {
      setActiveTab("wallet");
      // Clear state sau khi đã xử lý
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === "chats") {
      setLoadingChats(true);
      const fetchChats = async () => {
        try {
          const data = await getChats();
          const chatList = Array.isArray(data.data.data) ? data.data.data : [];
          
          // Fetch thông tin chi tiết cho từng chat
          const chatsWithDetails = await Promise.all(
            chatList.map(async (chat: Chat) => {
              try {
                // Fetch thông tin sản phẩm
                let listingName = chat.listingId || "Không rõ sản phẩm";
                if (chat.listingId) {
                  try {
                    const product = await getProductById(chat.listingId);
                    listingName = product.name || chat.listingId;
                  } catch (err) {
                    console.error("Error fetching product:", err);
                  }
                }

                // Fetch thông tin người bán
                let sellerName = chat.sellerId || "Không rõ người bán";
                if (chat.sellerId) {
                  try {
                    const seller = await getUserById(chat.sellerId);
                    sellerName = seller.fullName || seller.displayName || chat.sellerId;
                  } catch (err) {
                    console.error("Error fetching seller:", err);
                  }
                }

                return {
                  ...chat,
                  listingName,
                  sellerName,
                };
              } catch (err) {
                return chat;
              }
            })
          );
          
          setChats(chatsWithDetails);
        } catch (error) {
          setChats([]);
        } finally {
          setLoadingChats(false);
        }
      };
      fetchChats();
    }
    // Khi chuyển tab, clear chats nếu không phải tab "chats"
    else {
      setChats([]);
    }
  }, [activeTab]);

  // Load wallet when wallet tab is active
  useEffect(() => {
    if (activeTab === "wallet" && profile?.id) {
      setLoadingWallet(true);
      const fetchWallet = async () => {
        try {
          const walletData = await getWalletByUser(profile.id);
          setWallet(walletData);
        } catch (error) {
          console.error("Error fetching wallet:", error);
          setWallet(null);
        } finally {
          setLoadingWallet(false);
        }
      };
      fetchWallet();
    }
  }, [activeTab, profile?.id]);
  useEffect(() => {
    console.log("chats: ", chats);
  }, [chats]);
  // const userListings = mockVehicles.filter((v) => v.sellerId === mockUser.id);
  const userTransactions = mockTransactions.filter(
    (t) => t.buyerId === mockUser.id
  );

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
              Chưa có tài khoản?{" "}
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
    { id: "profile", name: "Hồ sơ", icon: User },
    { id: "listings", name: "Tin đăng", icon: Package },
    { id: "favorites", name: "Yêu thích", icon: Heart },
    { id: "wallet", name: "Ví của tôi", icon: Wallet },
    { id: "buyerOrders", name: "Lịch sử mua hàng", icon: Clock },
    { id: "sellerOrders", name: "Lịch sử bán hàng", icon: Clock },
    { id: "chats", name: "Tin nhắn", icon: MessageCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
                  <div className="text-white text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    <span>Click vào thông tin để chỉnh sửa</span>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {/* Avatar and Name Section */}
                <div className="flex items-center space-x-6 mb-8 pb-6 border-b">
                  <div className="relative group">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {/* Avatar image */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={handleAvatarClick}
                      title="Click để thay đổi ảnh đại diện"
                    >
                      <img
                        src={profile?.avatarUrl || "https://via.placeholder.com/150"}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-lg transition-all group-hover:border-blue-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                        }}
                      />
                      
                      {/* Overlay khi hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                          {uploadingImage ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-white text-xs font-medium">Đổi ảnh</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    {/* Họ tên - editable */}
                    {editingField === "fullName" ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="text-2xl font-bold text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveField("fullName");
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveField("fullName")}
                          disabled={editLoading}
                          className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          ✓ Lưu
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm font-medium"
                        >
                          ✕ Hủy
                        </button>
                      </div>
                    ) : (
                      <h3 
                        className="text-2xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors inline-flex items-center group"
                        onClick={() => handleInlineEdit("fullName", profile?.fullName || "")}
                        title="Click để chỉnh sửa"
                      >
                        {profile?.fullName}
                        <Edit className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    )}
                    
                    {/* Tên hiển thị - editable */}
                    {editingField === "displayName" ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          placeholder="Nhập tên hiển thị"
                          className="text-lg text-gray-500 border-2 border-blue-500 rounded px-2 py-1 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveField("displayName");
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveField("displayName")}
                          disabled={editLoading}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="text-lg text-gray-500 mb-2 cursor-pointer hover:text-blue-600 transition-colors inline-flex items-center group"
                        onClick={() => handleInlineEdit("displayName", profile?.displayName || "")}
                        title="Click để chỉnh sửa tên hiển thị"
                      >
                        {profile?.displayName ? `(${profile.displayName})` : "(Thêm tên hiển thị)"}
                        <Edit className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    
                    <p className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile?.email} <span className="text-xs text-gray-400 ml-2">(Không thể sửa)</span>
                    </p>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone - editable */}
                  <div 
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
                    onClick={() => editingField !== "phone" && handleInlineEdit("phone", profile?.phone || "")}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                        Số điện thoại
                        <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      {editingField === "phone" ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="tel"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="font-semibold text-gray-900 border-2 border-blue-500 rounded px-2 py-1 flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveField("phone");
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveField("phone")}
                            disabled={editLoading}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-900">{profile?.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address - editable */}
                  <div 
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
                    onClick={() => editingField !== "address" && handleInlineEdit("address", profile?.address || "")}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                        Địa chỉ
                        <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      {editingField === "address" ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder="Nhập địa chỉ"
                            className="font-semibold text-gray-900 border-2 border-blue-500 rounded px-2 py-1 flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveField("address");
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveField("address")}
                            disabled={editLoading}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-900">{profile?.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vai trò</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {profile?.role === "Admin" ? "Quản trị viên" : profile?.role === "Moderator" ? "Người kiểm duyệt" : "Người dùng"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 ${profile?.isActive ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-5 h-5 ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        profile?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.isActive ? "Hoạt động" : "Khóa"}
                      </span>
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
                <h3 className="text-lg font-semibold">
                  {userTransactions.length}
                </h3>
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

      case "listings":
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
                  <div
                    key={listing.id}
                    className="border rounded-lg p-4 flex items-center space-x-4"
                  >
                    <img
                      src={
                        listing.images && listing.images.length > 0
                          ? listing.images[0]
                          : ""
                      }
                      alt={listing.name}
                      className="w-20 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{listing.name}</h3>
                      <p className="text-blue-600 font-medium">
                        {formatCurrency(listing.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Đăng ngày{" "}
                        {new Date(listing?.createdAt || "").toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          listing.status === "published" ||
                          listing.status === "available"
                            ? "bg-green-100 text-green-800"
                            : listing.status === "sold"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {listing.status === "published" ||
                        listing.status === "available"
                          ? "Đang bán"
                          : listing.status === "sold"
                          ? "Đã bán"
                          : listing.status === "pending"
                          ? "Đang chờ duyệt"
                          : "Đang xử lý"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "favorites":
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

      case "buyerOrders":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Lịch sử mua hàng</h2>
            {buyerOrders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có đơn mua nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buyerOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{order.product?.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Giá trị:</strong>{" "}
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p>
                        <strong>Phương thức:</strong> {order.paymentMethod}
                      </p>
                      <p>
                        <strong>Ngày mua:</strong>{" "}
                        {order.timeline?.[0]?.updatedAt
                          ? new Date(
                              order.timeline[0].updatedAt
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "sellerOrders":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Lịch sử bán hàng</h2>
            {sellerOrders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có đơn bán nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellerOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{order.product?.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Giá trị:</strong>{" "}
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p>
                        <strong>Phương thức:</strong> {order.paymentMethod}
                      </p>
                      <p>
                        <strong>Ngày bán:</strong>{" "}
                        {order.timeline?.[0]?.updatedAt
                          ? new Date(
                              order.timeline[0].updatedAt
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "chats":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Tin nhắn</h2>
            {loadingChats ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border rounded-lg p-4 flex justify-between items-center hover:bg-blue-50 transition cursor-pointer"
                    onClick={() =>
                      navigate(`/chat/${chat.listingId}/${chat.sellerId}`)
                    }
                  >
                    <div>
                      <div className="font-semibold">
                        Sản phẩm: {chat.listingName || chat.listingId}
                      </div>
                      <div className="text-sm text-gray-600">
                        Người bán: {chat.sellerName || chat.sellerId}
                      </div>
                      {/* Có thể bổ sung thêm thông tin người mua/người bán nếu API trả về */}
                    </div>
                    <button className="text-blue-600 font-medium">
                      Trò chuyện
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "wallet":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Ví của tôi
            </h2>

            {loadingWallet ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Đang tải thông tin ví...</p>
              </div>
            ) : wallet ? (
              <div className="space-y-6">
                {/* Thẻ hiển thị số dư */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-6 h-6" />
                      <span className="text-lg font-medium">Số dư ví</span>
                    </div>
                    <img 
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" 
                      alt="ZaloPay"
                      className="h-8 w-auto bg-white rounded px-2 py-1"
                    />
                  </div>
                  <div className="text-3xl font-bold">
                    {wallet.balance ? formatCurrency(Number(wallet.balance)) : formatCurrency(0)}
                  </div>
                  {/* <p className="text-blue-100 text-sm mt-2">
                    Mã ví: {wallet._id || "N/A"}
                  </p> */}
                </div>

                {/* Thông tin ví */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Người dùng</div>
                    <div className="font-semibold">{profile?.fullName || "N/A"}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => setShowTopUpModal(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nạp tiền
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Lịch sử giao dịch
                  </button>
                </div>

                {/* Thông tin thanh toán */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thanh toán với ZaloPay
                  </h3>
                  <p className="text-sm text-gray-700">
                    Sử dụng ví của bạn để thanh toán nhanh chóng và an toàn khi mua hàng. 
                    Số dư ví có thể được nạp thông qua ZaloPay và các phương thức thanh toán khác.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có thông tin ví</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Kích hoạt ví
                </button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và hoạt động
          </p>
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
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50"
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
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>

      {/* Modal Nạp tiền */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Nạp tiền vào ví</h3>
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền nạp (VND)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Nhập số tiền muốn nạp"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10000"
                step="10000"
              />
              <p className="text-xs text-gray-500 mt-1">Số tiền nạp tối thiểu: 10,000 VND</p>
            </div>

            {/* Các mức nạp nhanh */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Chọn nhanh:</p>
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-sm"
                  >
                    {formatCurrency(amount).replace("₫", "đ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Thanh toán qua ZaloPay</p>
                  <p>Bạn sẽ được chuyển đến trang thanh toán ZaloPay để hoàn tất giao dịch.</p>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={topUpLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {topUpLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nạp tiền
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa thông tin cá nhân - KHÔNG DÙNG NỮA */}
      {false && showEditModal ? (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999, position: 'fixed' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" style={{ position: 'relative', zIndex: 10000 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa thông tin cá nhân</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  // Reset lại form data từ profile hiện tại
                  if (profile) {
                    setEditFormData({
                      fullName: profile.fullName || "",
                      displayName: profile.displayName || "",
                      phone: profile.phone || "",
                      avatarUrl: profile.avatarUrl || "",
                      address: profile.address || "",
                    });
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  placeholder="Nhập họ tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tên hiển thị */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  placeholder="Nhập tên hiển thị (tùy chọn)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Định dạng: 10-11 chữ số</p>
              </div>

              {/* URL Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Avatar
                </label>
                <input
                  type="url"
                  value={editFormData.avatarUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                  placeholder="Nhập URL hình đại diện (tùy chọn)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {editFormData.avatarUrl && (
                  <div className="mt-2">
                    <img 
                      src={editFormData.avatarUrl} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email (chỉ hiển thị, không cho chỉnh sửa) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>
            </form>

            {/* Nút hành động */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  // Reset lại form data
                  if (profile) {
                    setEditFormData({
                      fullName: profile.fullName || "",
                      displayName: profile.displayName || "",
                      phone: profile.phone || "",
                      avatarUrl: profile.avatarUrl || "",
                      address: profile.address || "",
                    });
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={editLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleEditProfile}
                disabled={editLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
           </div>
         </div>
       ) : null}
     </div>
   );
 };
 
 export default AccountPage;
