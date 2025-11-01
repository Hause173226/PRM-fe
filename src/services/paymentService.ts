import axiosInstance from "./axiosInstance";

export interface CreateZaloPayPayload {
  amount: number;
  description: string;
  userId: string;
}

/**
 * Interface cho response từ Backend API
 */
export interface ZaloPayResponse {
  success: boolean;
  data?: {
    appTransId: string;
    orderUrl: string;
  };
  message?: string;
}

/**
 * Interface cho kết quả đã được chuẩn hóa
 */
export interface CreateZaloPayResult {
  success: boolean;
  orderUrl?: string;
  appTransId?: string;
  message?: string;
  raw?: ZaloPayResponse; // full response for debugging
}

/**
 * Gọi API tạo URL ZaloPay và trả về object chứa thông tin thanh toán.
 * Backend trả về:
 * {
 *   "success": true,
 *   "data": {
 *     "appTransId": "251101_021158852_1837",
 *     "orderUrl": "https://qcgateway.zalopay.vn/openinapp?order=..."
 *   }
 * }
 */
export const createZaloPayUrl = async (
  payload: CreateZaloPayPayload
): Promise<CreateZaloPayResult> => {
  const res = await axiosInstance.post<ZaloPayResponse>("/zalopay/create-order", payload);
  const data = res.data;

  // Chuẩn hóa response
  return {
    success: data.success || false,
    orderUrl: data.data?.orderUrl,
    appTransId: data.data?.appTransId,
    message: data.message,
    raw: data,
  };
};
