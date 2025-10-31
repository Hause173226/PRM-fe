import axiosInstance from "./axiosInstance";

export interface Product {
  id?: string;
  brand: string;
  voltage: string;
  cycleCount: number;
  location: string;
  warranty: string;
  name: string;
  type: string;
  capacity: string;
  condition: string;
  status: string;
  year: number;
  price: number;
  images: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId: string;
}

export const getProducts = async (
  params?: Partial<Product> & { page?: number; pageSize?: number }
) => {
  const res = await axiosInstance.get<Product[]>("/products", { params });
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await axiosInstance.get<Product>(`/products/${id}`);
  return res.data;
};

export const getMyProducts = async () => {
  const res = await axiosInstance.get<Product[]>("/products/my-products");
  return res.data;
};

export const createProduct = async (data: Omit<Product, "id">) => {
  const res = await axiosInstance.post<Product>("/products", data);
  return res.data;
};

export const updateProduct = async (id: string, data: Omit<Product, "id">) => {
  const res = await axiosInstance.put<Product>(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
};
