import axiosInstance from "./axiosInstance";

export const getProfile = async () => {
  const res = await axiosInstance.get("/users/profile");
  return res.data;
};

export interface UpdateProfilePayload {
  fullName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
}

export const updateProfile = async (userId: string, data: UpdateProfilePayload) => {
  const res = await axiosInstance.put(`/users/${userId}`, data);
  return res.data;
};

export const getUserById = async (userId: string) => {
  const res = await axiosInstance.get(`/users/${userId}`);
  return res.data;
};