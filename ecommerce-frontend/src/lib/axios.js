import axios from "axios";

// ─── Token In-Memory State ──────────────────────────────────────────────────
let _accessToken = "";

export const setAccessToken = (token) => {
  _accessToken = token;
};

export const getAccessToken = () => {
  return _accessToken;
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Axios Instance Create Karo ─────────────────────────────────────────────
const api = axios.create({
  baseURL,
  withCredentials: true, // ← HAR request ke saath HttpOnly cookies bhejne ke liye zaroori hai
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR: Har request se pehle in-memory accessToken attach karo ───
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      originalRequest._retry = true;

      try {
        // Naya Access Token maango backend se
        // Note: Body khali bhejenge kyunki refresh token automatically cookie mein jaayega
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true } // ← Credentials ke sath call karo
        );

        if (response.data.success) {
          const { accessToken } = response.data;

          // In-memory state update karo
          setAccessToken(accessToken);

          // Purani request ke headers ko naye token se update karo
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Original request ko dobara execute karo
          return api(originalRequest);
        }
      } catch (refreshError) {
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
  setAccessToken("");
  if (typeof window !== "undefined") {
    localStorage.removeItem("user"); // sirf user info store rahegi non-critical data
    window.location.href = "/login";
  }
};

export default api;
