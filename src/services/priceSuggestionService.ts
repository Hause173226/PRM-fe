import axiosInstance from "./axiosInstance";

export interface PriceSuggestionData {
  suggestedPrice: number;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: string;
  factors?: string[];
  explanation?: string;
  soh?: number;
}

export interface PriceSuggestionRequest {
  brand: string;
  year: number;
  cycleCount: number;
  capacity: string;
  condition: string;
  voltage: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getPriceSuggestion = async (
  payload: PriceSuggestionRequest
): Promise<PriceSuggestionData> => {
  const res = await axiosInstance.post<ApiResponse<PriceSuggestionData>>(
    "/price-suggestion",
    payload
  );

  const body = res.data;
  if (!body) throw new Error("No response from price suggestion API");

  if (!body.success) {
    // nếu backend trả message lỗi
    throw new Error(body.message || "Lấy gợi ý giá thất bại");
  }

  if (!body.data) throw new Error("Price suggestion data missing");

  return body.data;
};
