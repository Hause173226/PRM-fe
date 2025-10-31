import axiosInstance from "./axiosInstance";

export interface CreateZaloPayPayload {
  amount: number;
  description: string;
}

export interface CreateZaloPayResult {
  orderUrl?: string; // normalized field for redirect
  raw?: any; // full response for debugging
}

/**
 * Gọi API tạo URL ZaloPay và trả về object chứa `orderUrl`.
 * Backend trả về { orderurl: "https://..." }
 */
export const createZaloPayUrl = async (
  payload: CreateZaloPayPayload
): Promise<CreateZaloPayResult> => {
  const res = await axiosInstance.post("/api/zalopay/create-order", payload);
  const data = res.data ?? {};

  // Lấy orderUrl từ response
  const orderUrl =
    data?.orderurl ||
    data?.orderUrl ||
    data?.data?.orderurl ||
    data?.data?.orderUrl ||
    (typeof data === "string" ? data : undefined);

  return { orderUrl, raw: data };
};
