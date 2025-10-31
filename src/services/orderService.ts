import axiosInstance from "./axiosInstance";

export interface CreateOrderPayload {
  productId: string;
  paymentMethod: string;
  shippingAddress: string;
  notes?: string;
  shippingFee?: number;
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await axiosInstance.post("/orders", payload);
  return res.data;
};
