import axios from "axios";

// ─── Axios Instance Create Karo ─────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR: Har request se pehle accessToken attach karo ──────────
api.interceptors.request.use(
  (config) => {
    // Check if running on browser (client-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR: Auto Token Refresh Flow ───────────────────────────
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Agar error 401 (Unauthorized) hai aur humne pehle retry nahi kiya hai
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Retry flag lagao taake infinite loop na bane

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Refresh token nahi hai toh seedha logout karwao
          handleGlobalLogout();
          return Promise.reject(error);
        }

        // Naya Access Token maango backend se
        // Note: Hum api instance ki jagah standard axios call karenge taake interceptor loop na ho
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success) {
          const { accessToken } = response.data;

          // LocalStorage update karo
          localStorage.setItem("accessToken", accessToken);

          // Purani request ke headers ko naye token se update karo
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Original request ko dobara execute karo
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Agar refresh token bhi expire ho gaya hai
        console.error("Refresh token verification failed, logging out...", refreshError);
        handleGlobalLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── HELPER: Global Logout Function ──────────────────────────────────────────
const handleGlobalLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Window reload karke ya home/login page pe redirect kardo
    window.location.href = "/login";
  }
};

export default api;
