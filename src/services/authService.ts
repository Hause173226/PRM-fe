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

// Extract tokens from common and nested API shapes
const extractTokens = (raw: any): TokenResponse => {
  const d = raw ?? {};

  const direct: TokenResponse = {
    accessToken:
      d.accessToken || d.access_token || d.token || d.jwt || d.access || d.data?.accessToken || d.data?.access_token,
    refreshToken:
      d.refreshToken || d.refresh_token || d.refresh || d.data?.refreshToken || d.data?.refresh_token,
  };

  if (direct.accessToken || direct.refreshToken) return direct;

  // Try nested containers: token, tokens, result, data.token, payload, content
  const containers = [
    d.token,
    d.tokens,
    d.result,
    d.payload,
    d.content,
    d.data?.token,
    d.data?.tokens,
    d.data?.result,
  ].filter(Boolean);

  for (const c of containers) {
    const nested: TokenResponse = {
      accessToken: c?.accessToken || c?.access_token || c?.jwt || c?.access,
      refreshToken: c?.refreshToken || c?.refresh_token || c?.refresh,
    };
    if (nested.accessToken || nested.refreshToken) return nested;
  }

  // Deep search keys heuristically up to a safe depth
  const seen = new Set<any>();
  const queue: any[] = [d];
  let found: TokenResponse = {};
  let depth = 0;
  while (queue.length && depth < 5) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const obj = queue.shift();
      if (!obj || typeof obj !== "object" || seen.has(obj)) continue;
      seen.add(obj);
      for (const [k, v] of Object.entries(obj)) {
        const key = k.toLowerCase();
        if (typeof v === "string") {
          if (!found.accessToken && (key.includes("access") || key.includes("token") || key.includes("jwt"))) {
            found.accessToken = v;
          }
          if (!found.refreshToken && key.includes("refresh")) {
            found.refreshToken = v;
          }
        } else if (v && typeof v === "object") {
          queue.push(v);
        }
      }
    }
    depth++;
    if (found.accessToken || found.refreshToken) return found;
  }

  return {};
};

const saveTokens = (raw: any) => {
  const data = extractTokens(raw);
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (!data.accessToken && !data.refreshToken) {
    // eslint-disable-next-line no-console
    console.warn("authService: No tokens found in response payload", raw);
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
