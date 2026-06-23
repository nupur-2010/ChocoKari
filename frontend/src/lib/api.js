// @ts-nocheck
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://chocokari.onrender.com";

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
};

const onRefreshFailed = () => {
    refreshSubscribers.forEach((cb) => cb(null));
    refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (r) => r,
    async (err) => {
        const originalRequest = err?.config;
        if (err?.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken) => {
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(api(originalRequest));
                        } else {
                            reject(err);
                        }
                    });
                });
            }

            isRefreshing = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post(
                    `${API_BASE}/user/refresh-token`,
                    refreshToken ? { refreshToken } : {},
                    { withCredentials: true },
                );
                const newToken = res?.data?.data?.accessToken;
                const newRefreshToken = res?.data?.data?.refreshToken;
                if (newToken) {
                    localStorage.setItem("accessToken", newToken);
                    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
                    onRefreshed(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
                onRefreshFailed();
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return Promise.reject(err);
            } catch (e) {
                onRefreshFailed();
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    },
);

