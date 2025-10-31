import axiosInstance from "./axiosInstance";

export interface WalletInfo {
  _id?: string;
  userId?: string;
  balance?: string;
}

export const getWalletByUser = async (userId: string): Promise<WalletInfo> => {
  const res = await axiosInstance.get(`/wallets/users/${userId}`);
  return res.data;
};
