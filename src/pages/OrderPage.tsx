import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createOrder } from "../services/orderService";
import { getProductById, Product } from "../services/productService";
import { getWalletByUser, WalletInfo } from "../services/walletService";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const OrderPage: React.FC = () => {
  // ...existing code...
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [form, setForm] = useState({
    paymentMethod: "COD",
    shippingAddress: "",
    notes: "",
    shippingFee: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // new states for wallet/top-up flow
  const [shortfall, setShortfall] = useState<number | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false); // <-- modal flag

  // ...existing code (useEffect, helpers)...
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (productId) {
          const data = await getProductById(productId);
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "shippingFee" ? Number(value) : value,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const totalPrice = product ? product.price + Number(form.shippingFee) : 0;

  const getCurrentUserId = (): string | null => {
    // chỉnh theo cách app bạn lưu auth
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        return u?.id || u?._id || u?.userId || null;
      } catch {
        return null;
      }
    }
    return localStorage.getItem("userId") || null;
  };

  const handleTopUpAndPay = async () => {
    // Chuyển hướng đến trang ví để nạp tiền
    navigate("/account", { state: { openTab: "wallet" } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shippingAddress.trim()) {
      setError("Vui lòng nhập địa chỉ nhận hàng");
      return;
    }
    setLoading(true);
    setError(null);
    setShortfall(null);
    setShowTopUpModal(false);

    try {
      await createOrder({
        productId: productId || "",
        paymentMethod: form.paymentMethod,
        shippingAddress: form.shippingAddress,
        notes: form.notes,
        shippingFee: Number(form.shippingFee) || 0,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Đặt hàng thất bại!";
      // nếu backend trả shortfall trực tiếp
      const serverShort =
        err?.response?.data?.shortfall ?? err?.response?.data?.needAmount;
      if (serverShort) {
        const need = Number(serverShort);
        setShortfall(need);
        setError("Số dư ví không đủ để thanh toán đơn hàng");
        setShowTopUpModal(true);
      } else {
        // nếu lỗi liên quan đến số dư, lấy số dư hiện tại từ API ví để tính shortfall
        const lower = String(msg).toLowerCase();
        if (
          lower.includes("không đủ") ||
          lower.includes("số dư") ||
          lower.includes("ví")
        ) {
          try {
            const userId = getCurrentUserId();
            if (userId) {
              const wallet: WalletInfo = await getWalletByUser(userId);
              // đọc nhiều dạng field (normalize)
              const rawBalance =
                (wallet as any).balance ??
                (wallet as any).Balance ??
                (wallet as any).amount ??
                (wallet as any).Amount ??
                (wallet as any)._raw?.Balance ??
                (wallet as any)._raw?.balance ??
                0;
              const balance = Number(rawBalance) || 0;
              const need = Math.max(0, totalPrice - balance);
              setShortfall(need);
              setError("Số dư ví không đủ để thanh toán đơn hàng");
              setShowTopUpModal(true);
            } else {
              setError(msg);
            }
          } catch (e) {
            console.error("Failed to fetch wallet", e);
            setError(msg);
          }
        } else {
          setError(msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ...existing JSX rendering (loading, not found, success) ...

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy sản phẩm</p>
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn
              sớm nhất.
            </p>
            <div className="space-y-3">
              <Link
                to="/account"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Xem đơn hàng
              </Link>
              <Link
                to="/"
                className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={`/products/${productId}`}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại sản phẩm
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xác nhận đặt hàng
          </h1>
          <p className="text-gray-600">
            Vui lòng kiểm tra thông tin và hoàn tất đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Sản phẩm đặt mua
              </h2>
              <div className="flex items-center space-x-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.brand} - {product.type}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Địa chỉ nhận hàng
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={form.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Bank"
                      checked={form.paymentMethod === "Bank"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        Chuyển khoản ngân hàng
                      </div>
                      <div className="text-sm text-gray-600">
                        Chuyển khoản trước khi nhận hàng
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Fee */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Phí vận chuyển
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phí vận chuyển (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="shippingFee"
                    value={form.shippingFee}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min={0}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Phí vận chuyển sẽ được tính dựa trên địa chỉ giao hàng
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Ghi chú đơn hàng
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (Tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Ghi chú thêm cho người bán (ví dụ: thời gian giao hàng mong muốn)"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary (unchanged) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Giá sản phẩm</span>
                  <span className="font-medium">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {formatPrice(Number(form.shippingFee))}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Nút xác nhận đặt hàng (nằm ngoài form -> gọi trực tiếp handleSubmit) */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Xác nhận đặt hàng</span>
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Đơn hàng của bạn được bảo vệ bởi chính sách đổi trả của
                    MarketPlace
                  </span>
                </div>
              </div>

              {/* Hiển thị lỗi / top-up nếu có */}
              {error && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <svg
                    className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {shortfall !== null && shortfall > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-700 mb-2">
                    Số tiền cần nạp:{" "}
                    <span className="font-semibold text-red-600">
                      {formatPrice(shortfall)}
                    </span>
                  </div>
                  <button
                    onClick={handleTopUpAndPay}
                    disabled={topUpLoading}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      topUpLoading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {topUpLoading
                      ? "Chuyển tới cổng thanh toán..."
                      : "Nạp tiền & Thanh toán"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top-up modal */}
      {showTopUpModal && shortfall !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => setShowTopUpModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold mb-3">Số dư ví không đủ</h3>
            <p className="text-sm text-gray-700 mb-4">
              Số dư ví hiện tại không đủ để thanh toán đơn hàng. Vui lòng nạp
              thêm tiền để hoàn tất.
            </p>
            <div className="mb-4">
              <div className="text-sm text-gray-600">Số tiền cần nạp:</div>
              <div className="text-xl font-bold text-red-600">
                {formatPrice(shortfall)}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleTopUpAndPay}
                disabled={topUpLoading}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  topUpLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {topUpLoading ? "Đang chuyển hướng..." : "Nạp tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
