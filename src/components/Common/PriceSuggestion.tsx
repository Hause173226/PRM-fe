import React, { useState } from "react";
import { X } from "lucide-react";
import {
  getPriceSuggestion,
  PriceSuggestionRequest,
  PriceSuggestionData,
} from "../../services/priceSuggestionService";
import { MdPriceCheck } from "react-icons/md";

const PriceSuggestion: React.FC = () => {
  // Price suggestion state
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestResult, setSuggestResult] =
    useState<PriceSuggestionData | null>(null);
  const [suggestForm, setSuggestForm] = useState<PriceSuggestionRequest>({
    brand: "",
    year: new Date().getFullYear(),
    cycleCount: 0,
    capacity: "",
    condition: "",
    voltage: "",
  });

  const handleSuggestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSuggestForm((prev) => ({
      ...prev,
      [name]: name === "year" || name === "cycleCount" ? Number(value) : value,
    }));
  };

  const handleSuggest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSuggestError(null);
    setSuggestResult(null);

    // basic validation
    if (
      !suggestForm.brand ||
      !suggestForm.capacity ||
      !suggestForm.condition ||
      !suggestForm.voltage
    ) {
      setSuggestError(
        "Vui lòng điền đầy đủ: Hãng, Dung lượng, Tình trạng, Điện áp"
      );
      return;
    }

    setSuggestLoading(true);
    try {
      const res = await getPriceSuggestion(suggestForm);
      setSuggestResult(res);
    } catch (err: any) {
      setSuggestError(err?.message || "Lấy gợi ý giá thất bại");
    } finally {
      setSuggestLoading(false);
    }
  };

  return (
    <>
      {/* Price Suggest Button (above chat) */}
      <button
        onClick={() => setIsSuggestOpen(!isSuggestOpen)}
        title="Gợi ý giá"
        className="fixed bottom-[86px] right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors z-50 flex items-center justify-center"
      >
        {isSuggestOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MdPriceCheck className="w-6 h-6" />
        )}
      </button>

      {/* Price Suggestion Panel */}
      {isSuggestOpen && (
        <div className="fixed bottom-36 right-6 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="bg-green-600 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="font-medium">Gợi ý giá</div>
            <button
              onClick={() => {
                setIsSuggestOpen(false);
                setSuggestResult(null);
                setSuggestError(null);
              }}
              className="opacity-90 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSuggest} className="p-3 space-y-2">
            <div>
              <label
                htmlFor="ps-brand"
                className="text-sm font-medium text-gray-700"
              >
                Hãng sản xuất
              </label>
              <input
                id="ps-brand"
                name="brand"
                value={suggestForm.brand}
                onChange={handleSuggestChange}
                placeholder="Hãng"
                className="w-full px-2 py-1 border rounded mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <div className="w-1/2">
                <label
                  htmlFor="ps-year"
                  className="text-sm font-medium text-gray-700"
                >
                  Năm sản xuất
                </label>
                <input
                  id="ps-year"
                  name="year"
                  type="number"
                  value={suggestForm.year}
                  onChange={handleSuggestChange}
                  min="2000"
                  max="2025"
                  required
                  className="w-full px-2 py-1 border rounded mt-1"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="ps-cycleCount"
                  className="text-sm font-medium text-gray-700"
                >
                  Chu kỳ
                </label>
                <input
                  id="ps-cycleCount"
                  name="cycleCount"
                  type="number"
                  value={suggestForm.cycleCount}
                  onChange={handleSuggestChange}
                  placeholder="Chu kỳ"
                  className="w-full px-2 py-1 border rounded mt-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="ps-capacity"
                className="text-sm font-medium text-gray-700"
              >
                Dung lượng
              </label>
              <input
                id="ps-capacity"
                name="capacity"
                value={suggestForm.capacity}
                onChange={handleSuggestChange}
                placeholder="Dung lượng (VD: 30Ah)"
                className="w-full px-2 py-1 border rounded mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng pin <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={suggestForm.condition}
                onChange={handleSuggestChange}
                className="w-full px-2 py-1 border rounded mt-1"
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

            <div>
              <label
                htmlFor="ps-voltage"
                className="text-sm font-medium text-gray-700"
              >
                Điện áp
              </label>
              <input
                id="ps-voltage"
                name="voltage"
                value={suggestForm.voltage}
                onChange={handleSuggestChange}
                placeholder="Điện áp (VD: 48V)"
                className="w-full px-2 py-1 border rounded mt-1"
              />
            </div>

            {suggestError && (
              <div className="text-red-600 text-sm">{suggestError}</div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={suggestLoading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              >
                {suggestLoading ? "Đang..." : "Lấy gợi ý"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuggestForm({
                    brand: "",
                    year: new Date().getFullYear(),
                    cycleCount: 0,
                    capacity: "",
                    condition: "",
                    voltage: "",
                  });
                  setSuggestResult(null);
                  setSuggestError(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Xóa
              </button>
            </div>

            {suggestResult && (
              <div className="mt-2 p-2 border rounded bg-gray-50 text-sm">
                <div className="font-semibold">
                  Giá gợi ý:{" "}
                  <span className="text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(suggestResult.suggestedPrice)}
                  </span>
                </div>
                {suggestResult.minPrice !== undefined &&
                  suggestResult.maxPrice !== undefined && (
                    <div className="text-gray-600">
                      Khoảng:{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        suggestResult.minPrice
                      )}{" "}
                      -{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        suggestResult.maxPrice
                      )}{" "}
                      VND
                    </div>
                  )}
                {suggestResult.priceRange && (
                  <div className="text-gray-600 mt-1">
                    {suggestResult.priceRange}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default PriceSuggestion;
