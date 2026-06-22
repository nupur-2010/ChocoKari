// @ts-nocheck
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get("/user/me");
                if (res?.data?.data?.user) {
                    setUser(res.data.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.data.user));
                }
            } catch (e) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/user/login", { email, password });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (fullname, email, password) => {
        const res = await api.post("/user/register", { fullname, email, password });
        return res.data;
    };

    const googleAuth = async (credential) => {
        const res = await api.post("/user/google-auth", { credential });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return user;
    };

    const linkGoogle = async (credential) => {
        const res = await api.post("/user/google-link", { credential });
        const { user } = res.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return user;
    };

    const verifyOtp = async (email, otp) => {
        const res = await api.post("/user/verify-email", { email, otp });
        return res.data;
    };

    const resendOtp = async (email) => {
        const res = await api.post("/user/resend-otp", { email });
        return res.data;
    };

    const forgotPassword = async (email) => {
        const res = await api.post("/user/forgot-password", { email });
        return res.data;
    };

    const resetPassword = async (token, password) => {
        const res = await api.post(`/user/reset-password/${token}`, { password });
        return res.data;
    };

    const logout = async () => {
        try { await api.post("/user/logout"); } catch (e) {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, googleAuth, linkGoogle, verifyOtp, resendOtp, forgotPassword, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
