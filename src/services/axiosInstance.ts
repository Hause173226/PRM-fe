import axios from "axios";
import { handleTokenExpiration } from "../utils/authUtils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token handling for signout requests
    if (originalRequest.url?.includes("/users/signout")) {
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried or is refresh token request, reject
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("refresh-token")
    ) {
      // If it's a 401 on refresh token endpoint, handle token expiration
      if (
        error.response?.status === 401 &&
        originalRequest.url?.includes("refresh-token")
      ) {
        handleTokenExpiration();
      }

      return Promise.reject(error);
    }

    if (isRefreshing) {
      try {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token available, handle token expiration
        handleTokenExpiration();
        throw new Error("No refresh token available");
      }

      // Call refresh token endpoint with correct format
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/users/refresh-token`,
        { refreshToken: refreshToken },
        { withCredentials: true }
      );

      // Store new tokens according to API response format
      if (response.data?.accessToken && response.data?.refreshToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Update Authorization header
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      } else {
        throw new Error("Invalid token response format");
      }

      // Process queued requests
      processQueue(null, response.data.accessToken);
      isRefreshing = false;

      // Retry original request
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Reset flags and process queue with error
      processQueue(refreshError, null);
      isRefreshing = false;

      // Handle token expiration
      handleTokenExpiration();

      // Reject the promise
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
