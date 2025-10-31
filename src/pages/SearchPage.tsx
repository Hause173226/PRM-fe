import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import VehicleCard from "../components/Common/VehicleCard";
import { getProducts, Product } from "../services/productService";
import { Vehicle } from "../types";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    brand: searchParams.get("brand") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    year: searchParams.get("year") || "",
    maxMileage: searchParams.get("maxMileage") || "",
    batteryCapacity: searchParams.get("batteryCapacity") || "",
    location: searchParams.get("location") || "",
  });

  const brands = Array.from(
    new Set(allProducts.map((p) => p.brand).filter(Boolean))
  );
  const years = Array.from(
    new Set(allProducts.map((p) => p.year).filter((y) => !!y))
  ).sort((a, b) => Number(b) - Number(a));
  const locations = Array.from(
    new Set(allProducts.map((p) => p.location).filter(Boolean))
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getProducts()
      .then((data: any) => {
        if (!mounted) return;
        // backend may return either Product[] or a paginated object { items: Product[], ... }
        const items: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setAllProducts(items);
      })
      .catch((err: any) => {
        console.error("Error fetching products:", err);
        setError("Không thể tải danh sách sản phẩm");
        setAllProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const mapProductToVehicle = (p: Product): Vehicle => {
    return {
      id: p.id || "",
      title: p.name,
      brand: p.brand,
      model: p.type || "",
      price: p.price,
      year: p.year,
      mileage: (p as any).mileage || 0,
      location: p.location || "",
      isFeatured:
        (p.status || "").toString().toLowerCase() === "published" ||
        (p.status || "").toString().toLowerCase() === "available",
      images: p.images || [],
    } as unknown as Vehicle;
  };

  useEffect(() => {
    let filtered = [...allProducts];

    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.type || "").toLowerCase().includes(q)
      );
    }

    if (filters.category)
      filtered = filtered.filter((p) => p.type === filters.category);
    if (filters.brand)
      filtered = filtered.filter((p) => p.brand === filters.brand);
    if (filters.minPrice)
      filtered = filtered.filter((p) => p.price >= parseInt(filters.minPrice));
    if (filters.maxPrice)
      filtered = filtered.filter((p) => p.price <= parseInt(filters.maxPrice));
    if (filters.year)
      filtered = filtered.filter((p) => p.year.toString() === filters.year);
    if (filters.maxMileage)
      filtered = filtered.filter(
        (p) =>
          (p as any).mileage === undefined ||
          (p as any).mileage <= parseInt(filters.maxMileage)
      );
    if (filters.location)
      filtered = filtered.filter((p) => p.location === filters.location);
    if (searchParams.get("featured") === "true") {
      filtered = filtered.filter(
        (p) =>
          (p.status || "").toString().toLowerCase() === "published" ||
          (p.status || "").toString().toLowerCase() === "available"
      );
    }

    setFilteredVehicles(filtered.map(mapProductToVehicle));
  }, [filters, searchParams, allProducts]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const newSearchParams = new URLSearchParams(searchParams);
    if (value) newSearchParams.set(key, value);
    else newSearchParams.delete(key);
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      year: "",
      maxMileage: "",
      batteryCapacity: "",
      location: "",
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-gray-600 mt-1">
              {loading
                ? "Đang tải..."
                : `Tìm thấy ${filteredVehicles.length} kết quả`}
            </p>
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                } rounded-l-lg transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                } rounded-r-lg transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại sản phẩm
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="car">Ô tô điện</option>
                    <option value="battery">Pin xe điện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hãng xe
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả hãng</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm sản xuất
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số km tối đa
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 50000"
                    value={filters.maxMileage}
                    onChange={(e) =>
                      handleFilterChange("maxMileage", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow p-4 animate-pulse"
                  >
                    <div className="h-44 bg-gray-200 rounded mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    to={`/products/${vehicle.id}`}
                    className="block"
                  >
                    <VehicleCard vehicle={vehicle} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
