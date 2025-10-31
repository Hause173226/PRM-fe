import axiosInstance from "./axiosInstance";

export const getProfile = async () => {
  const res = await axiosInstance.get("/users/profile");
  return res.data;
};
