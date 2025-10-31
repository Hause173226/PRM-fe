import axiosInstance from "./axiosInstance";

export interface CreateOrderPayload {
  productId: string;
  paymentMethod: string;
  shippingAddress: string;
  notes?: string;
  shippingFee?: number;
}

export interface Order {
  id: string;
  product: any; // Có thể tạo interface Product chi tiết nếu muốn
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  notes?: string;
  status: string;
  buyer: any;
  seller: any;
  timeline: Array<{
    fromStatus: string;
    toStatus: string;
    updatedById: string;
    updatedBy: string;
    updatedAt: string;
  }>;
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await axiosInstance.post("/orders", payload);
  return res.data;
};

// Lấy danh sách đơn hàng của người bán
export const getSellerOrders = async () => {
  const res = await axiosInstance.get<Order[]>("/orders/seller");
  return res.data;
};

// Lấy danh sách đơn hàng của người mua
export const getBuyerOrders = async () => {
  const res = await axiosInstance.get<Order[]>("/orders/buyer");
  return res.data;
};
