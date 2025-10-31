import axiosInstance from "./axiosInstance";

export interface CreatePaymentPayload {
  userId: string;
  amount: number;
  orderInfo?: string;
  returnUrl?: string;
}

export interface CreatePaymentResult {
  url?: string; // normalized field for redirect
  paymentUrl?: any; // raw paymentUrl field if present
  raw?: any; // full response for debugging
}

/**
 * Gọi API tạo URL VNPAY và trả về object chứa `url`.
 * Backend của bạn trả { paymentUrl: "https://..." } nên ta map về `url`.
 */
export const createPaymentUrl = async (
  payload: CreatePaymentPayload
): Promise<CreatePaymentResult> => {
  const res = await axiosInstance.post(
    "/api/vnpay/create-payment-url",
    payload
  );
  const data = res.data ?? {};

  // Các dạng field hay gặp
  const url =
    data?.paymentUrl ||
    data?.paymentURL ||
    data?.url ||
    data?.data?.paymentUrl ||
    data?.data?.url ||
    (typeof data === "string" ? data : undefined);

  return { url, paymentUrl: data?.paymentUrl, raw: data };
};
