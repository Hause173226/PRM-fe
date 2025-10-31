import axiosInstance from "./axiosInstance";

export interface CreateZaloPayPayload {
  amount: number;
  description: string;
}

/**
 * Interface cho response từ ZaloPay API
 */
export interface ZaloPayResponse {
  returncode: string; // "1" = success, "2" = failed, "3" = pending
  returnmessage: string;
  zptranstoken?: string;
  orderurl?: string;
}

/**
 * Interface cho kết quả đã được chuẩn hóa
 */
export interface CreateZaloPayResult {
  returncode: string;
  returnmessage: string;
  zptranstoken?: string;
  orderUrl?: string; // normalized field for redirect
  raw?: ZaloPayResponse; // full response for debugging
}

/**
 * Gọi API tạo URL ZaloPay và trả về object chứa thông tin thanh toán.
 * Backend trả về:
 * {
 *   "returncode": "1",
 *   "returnmessage": "",
 *   "zptranstoken": "ACJA44rMk79NZcX54H-GalYg",
 *   "orderurl": "https://qcgateway.zalopay.vn/openinapp?order=..."
 * }
 */
export const createZaloPayUrl = async (
  payload: CreateZaloPayPayload
): Promise<CreateZaloPayResult> => {
  const res = await axiosInstance.post<ZaloPayResponse>("/zalopay/create-order", payload);
  const data = res.data;

  // Chuẩn hóa response
  return {
    returncode: data.returncode || "0",
    returnmessage: data.returnmessage || "",
    zptranstoken: data.zptranstoken,
    orderUrl: data.orderurl, // normalize key to camelCase
    raw: data,
  };
};
