// @ts-nocheck
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRedirect() {
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => { navigate(user?.role === "admin" ? "/admin" : "/"); }, [user]);
    return null;
}
