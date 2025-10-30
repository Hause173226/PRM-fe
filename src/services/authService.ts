import axios from "axios";
import axiosInstance from "./axiosInstance";

type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  // ...các trường khác server trả về
};

const BASE_API = import.meta.env.VITE_REACT_APP_BASE_URL; // ví dụ: http://localhost:5000/api

const saveTokens = (data: TokenResponse) => {
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.accessToken}`;
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  delete axiosInstance.defaults.headers.common["Authorization"];
};

const register = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post<TokenResponse>(
    "/auth/register",
    payload
  );
  if (res.data) saveTokens(res.data);
  return res.data;
};

const login = async (payload: LoginPayload) => {
  const res = await axiosInstance.post<TokenResponse>("/auth/login", payload);
  if (res.data) saveTokens(res.data);
  return res.data;
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");
  // Gọi thẳng axios (không qua axiosInstance) để tránh vòng lặp interceptor nếu cần
  const res = await axios.post<TokenResponse>(
    `${BASE_API}/auth/refresh-token`,
    { refreshToken },
    { withCredentials: true }
  );
  if (res.data) saveTokens(res.data);
  return res.data;
};

const logout = async () => {
  try {
    // gọi logout endpoint (server trả 200)
    await axiosInstance.post("/auth/logout");
  } finally {
    // luôn clear token ở client
    clearTokens();
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
