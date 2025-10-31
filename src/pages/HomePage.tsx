import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Battery, ArrowRight, Zap, Shield, Users } from "lucide-react";
import { getProducts, Product } from "../services/productService";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts({ page: 1, pageSize: 12 });
      // Nếu API trả về object có field items, hãy lấy items
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray((data as { items?: Product[] }).items)) {
        setProducts((data as { items: Product[] }).items);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: "Lithium-ion",
      name: "Pin Lithium-ion",
      count: products.filter((p) => p.type === "Lithium-ion").length,
    },
    {
      id: "LiFePO4",
      name: "Pin LiFePO4",
      count: products.filter((p) => p.type === "LiFePO4").length,
    },
    {
      id: "NiMH",
      name: "Pin NiMH",
      count: products.filter((p) => p.type === "NiMH").length,
    },
    {
      id: "Lead-acid",
      name: "Pin Lead-acid",
      count: products.filter((p) => p.type === "Lead-acid").length,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Battery className="w-16 h-16 text-blue-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {product.condition}
        </div>
        {product.warranty && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            BH: {product.warranty}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Hãng:</span>
            <span className="font-medium text-gray-900">{product.brand}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Loại:</span>
            <span className="font-medium text-gray-900">{product.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Dung lượng:</span>
            <span className="font-medium text-gray-900">
              {product.capacity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Điện áp:</span>
            <span className="font-medium text-gray-900">{product.voltage}</span>
          </div>
          {product.cycleCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Chu kỳ sạc:</span>
              <span className="font-medium text-gray-900">
                {product.cycleCount} lần
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {product.location}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nền tảng mua bán xe điện
              <span className="block text-yellow-400">hàng đầu Việt Nam</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Kết nối người mua và người bán xe điện, pin và phụ kiện một cách
              an toàn, tiện lợi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Tìm pin ngay</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/post-listing"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                Đăng tin bán pin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn MarketPlace?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua bán tốt nhất cho cộng
              đồng xe điện Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">An toàn & Tin cậy</h3>
              <p className="text-gray-600">
                Hệ thống xác minh nghiêm ngặt đảm bảo mọi giao dịch đều an toàn
                và minh bạch
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Nhanh chóng & Tiện lợi
              </h3>
              <p className="text-gray-600">
                Đăng tin dễ dàng, tìm kiếm thông minh và giao dịch nhanh chóng
                chỉ trong vài bước
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cộng đồng lớn</h3>
              <p className="text-gray-600">
                Kết nối với hàng nghìn người dùng xe điện trên toàn quốc
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Danh mục pin xe điện
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá các loại pin xe điện phong phú
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?type=${category.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Battery className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.count} sản phẩm</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sản phẩm nổi bật
              </h2>
              <p className="text-gray-600">
                Những sản phẩm pin xe điện chất lượng cao
              </p>
            </div>
            <Link
              to="/search"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Battery className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Chưa có sản phẩm nào</p>
              <p className="text-sm text-gray-500">
                Hãy là người đầu tiên đăng tin bán pin!
              </p>
              <Link
                to="/post-listing"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng tin ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Listings */}
      {!loading && products.length > 6 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Tin đăng mới nhất
                </h2>
                <p className="text-gray-600">
                  Cập nhật liên tục những sản phẩm pin mới nhất
                </p>
              </div>
              <Link
                to="/search?sort=latest"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(6, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bán pin xe điện của bạn?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng tin miễn phí và tiếp cận hàng nghìn khách hàng tiềm năng
          </p>
          <Link
            to="/post-listing"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Đăng tin ngay</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
