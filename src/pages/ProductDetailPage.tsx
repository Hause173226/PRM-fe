import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, Product } from "../services/productService";
import {
  Battery,
  MapPin,
  Calendar,
  Zap,
  Award,
  Phone,
  Mail,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const data = await getProductById(id);
          setProduct(data);
        }
      } catch (err: any) {
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Battery className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa"}
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              to="/search"
              className="hover:text-blue-600 transition-colors"
            >
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative">
                {hasImages ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Battery className="w-32 h-32 text-blue-600" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {product.condition}
                  </div>
                  {product.warranty && (
                    <div className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      BH: {product.warranty}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? "border-blue-600 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thông tin chi tiết
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Battery className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hãng sản xuất</p>
                    <p className="font-semibold text-gray-900">
                      {product.brand}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại pin</p>
                    <p className="font-semibold text-gray-900">
                      {product.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Battery className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dung lượng</p>
                    <p className="font-semibold text-gray-900">
                      {product.capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điện áp</p>
                    <p className="font-semibold text-gray-900">
                      {product.voltage}
                    </p>
                  </div>
                </div>

                {product.cycleCount > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chu kỳ sạc</p>
                      <p className="font-semibold text-gray-900">
                        {product.cycleCount} lần
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Năm sản xuất</p>
                    <p className="font-semibold text-gray-900">
                      {product.year}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{product.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => navigate(`/order/${product.id}`)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Mua ngay</span>
                  </button>

                  <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Liên hệ người bán</span>
                  </button>
                </div>
              </div>

              {/* Seller Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin người bán
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <a
                        href="tel:0901234567"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        090 123 4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href="mailto:seller@example.com"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        seller@example.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa điểm</p>
                      <p className="font-medium text-gray-900">
                        {product.location}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Gửi tin nhắn
                </button>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Lưu ý an toàn
                </h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
                  <li>• Không chuyển tiền trước khi nhận hàng</li>
                  <li>• Giao dịch tại nơi công cộng an toàn</li>
                  <li>• Báo cáo nếu phát hiện gian lận</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
