import React, { useState } from "react";
import { Upload, X, Eye, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productService";

const PostListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  let userId = "";
  if (token) {
    // Giải mã phần payload của JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.userId || payload.id || ""; // Tùy backend trả về
  }

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    capacity: "",
    voltage: "",
    year: "",
    price: "",
    condition: "",
    cycleCount: "",
    warranty: "",
    location: "",
    description: "",
    images: [] as File[],
    createdAt: new Date().toISOString(),
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files].slice(0, 10); // Max 10 images

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 10));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    // Revoke URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const validate = () => {
    if (!formData.name.trim()) return "Vui lòng nhập tên sản phẩm";
    if (!formData.brand.trim()) return "Vui lòng nhập hãng sản xuất";
    if (!formData.type) return "Vui lòng chọn loại pin";
    if (!formData.capacity.trim()) return "Vui lòng nhập dung lượng pin";
    if (!formData.voltage.trim()) return "Vui lòng nhập điện áp";
    if (!formData.year) return "Vui lòng nhập năm sản xuất";
    if (!formData.price) return "Vui lòng nhập giá bán";
    if (!formData.condition) return "Vui lòng chọn tình trạng pin";
    if (!formData.location) return "Vui lòng chọn địa điểm";
    if (!formData.description.trim()) return "Vui lòng nhập mô tả chi tiết";
    if (formData.images.length === 0)
      return "Vui lòng tải lên ít nhất 1 hình ảnh";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert images to base64 strings
      const imageUrls: string[] = [];
      for (const file of formData.images) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          imageUrls.push(base64);
        } catch (err) {
          console.error("Error processing image:", err);
        }
      }

      const productData = {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        capacity: formData.capacity,
        voltage: formData.voltage,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        condition: formData.condition,
        cycleCount: parseInt(formData.cycleCount) || 0,
        warranty: formData.warranty,
        location: formData.location,
        description: formData.description,
        images: imageUrls,
        status: "Pending",
        ownerId: userId || "",
      };

      await createProduct(productData);

      alert(
        "Tin đăng của bạn đã được gửi thành công! Chúng tôi sẽ xem xét và phê duyệt trong vòng 24h."
      );
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng tin thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Pin Lithium 60V-20Ah cho xe điện"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hãng sản xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="VD: Samsung, LG, Panasonic..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại pin <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn loại pin</option>
                  <option value="Lithium-ion">Lithium-ion</option>
                  <option value="LiFePO4">
                    LiFePO4 (Lithium Iron Phosphate)
                  </option>
                  <option value="NiMH">NiMH (Nickel Metal Hydride)</option>
                  <option value="Lead-acid">Lead-acid (Axit-chì)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dung lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="VD: 20Ah, 30Ah, 60kWh..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điện áp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="voltage"
                  value={formData.voltage}
                  onChange={handleInputChange}
                  placeholder="VD: 48V, 60V, 72V..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm sản xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="2024"
                  min="2000"
                  max="2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="8500000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Thông số kỹ thuật</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng pin <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn tình trạng</option>
                <option value="Mới 100%">Mới 100%</option>
                <option value="Tốt (95%)">Tốt (95%)</option>
                <option value="Khá tốt (90%)">Khá tốt (90%)</option>
                <option value="Bình thường (85%)">Bình thường (85%)</option>
                <option value="Trung bình (80%)">Trung bình (80%)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số chu kỳ sạc (lần)
                </label>
                <input
                  type="number"
                  name="cycleCount"
                  value={formData.cycleCount}
                  onChange={handleInputChange}
                  placeholder="VD: 50, 100, 200..."
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống nếu pin mới chưa sử dụng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bảo hành
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  placeholder="VD: 12 tháng, 24 tháng, Hết bảo hành..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Mô tả chi tiết về pin: nguồn gốc, tình trạng thực tế, lý do bán, các thông số kỹ thuật khác..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Hình ảnh</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải lên hình ảnh <span className="text-red-500">*</span> (Tối đa
                10 ảnh)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Kéo thả hoặc click để tải ảnh lên
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Hình ảnh rõ nét sẽ giúp sản phẩm bán nhanh hơn
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Chọn ảnh
                </label>
              </div>
            </div>

            {imagePreviewUrls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Ảnh đã tải lên ({imagePreviewUrls.length}/10)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Ảnh chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP.HCM">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Huế">Huế</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
              </select>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Xem trước tin đăng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Tên sản phẩm:</span>
                    <p className="font-medium">
                      {formData.name || "Chưa nhập"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Giá bán:</span>
                    <p className="font-medium text-blue-600">
                      {formData.price
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(formData.price))
                        : "Chưa nhập"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Hãng:</span>
                    <p className="font-medium">
                      {formData.brand || "Chưa nhập"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Loại pin:</span>
                    <p className="font-medium">
                      {formData.type || "Chưa nhập"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Dung lượng:</span>
                    <p className="font-medium">
                      {formData.capacity || "Chưa nhập"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện áp:</span>
                    <p className="font-medium">
                      {formData.voltage || "Chưa nhập"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Năm SX:</span>
                    <p className="font-medium">
                      {formData.year || "Chưa nhập"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tình trạng:</span>
                    <p className="font-medium">
                      {formData.condition || "Chưa nhập"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Địa điểm:</span>
                  <p className="font-medium">
                    {formData.location || "Chưa nhập"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600">Số ảnh:</span>
                  <p className="font-medium">{formData.images.length} ảnh</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng tin bán pin xe điện
          </h1>
          <p className="text-gray-600">
            Điền thông tin chi tiết để thu hút nhiều khách hàng hơn
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-colors ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 text-xs md:text-sm text-gray-600 text-center">
            <span>Thông tin cơ bản</span>
            <span>Chi tiết kỹ thuật</span>
            <span>Hình ảnh</span>
            <span>Xác nhận</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200 flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                disabled={currentStep === 1}
              >
                Quay lại
              </button>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      loading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
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
                        <span>Đang đăng tin...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Đăng tin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostListingPage;
