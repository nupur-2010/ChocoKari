// @ts-nocheck
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
};

const LOCAL_KEY = "chocokari_local_wishlist";
const readLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
    catch { return []; }
};
const writeLocal = (w) => localStorage.setItem(LOCAL_KEY, JSON.stringify(w));

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState(readLocal);

    useEffect(() => {
        const sync = async () => {
            if (user) {
                try {
                    const res = await api.get("/wishlist");
                    setItems(res?.data?.data?.wishlist || []);
                } catch (e) {
                    setItems([]);
                }
            } else {
                setItems(readLocal());
            }
        };
        sync();
    }, [user]);

    const persist = (next) => {
        if (!user) writeLocal(next);
        setItems(next);
    };

    const addItem = useCallback(async (item) => {
        if (user) {
            const res = await api.post("/wishlist", item);
            setItems(res?.data?.data?.wishlist || []);
        } else {
            const exists = items.some(
                (i) => i.itemType === item.itemType && (
                    (item.productId && i.productId?._id === item.productId) ||
                    (item.customizationId && i.customizationId?._id === item.customizationId)
                ),
            );
            if (exists) return;
            persist([...items, item]);
        }
    }, [user, items]);

    const removeItem = useCallback(async (item) => {
        if (user) {
            const res = await api.delete("/wishlist", {
                data: { itemType: item.itemType, productId: item.productId?._id || item.productId, customizationId: item.customizationId?._id || item.customizationId },
            });
            setItems(res?.data?.data?.wishlist || []);
        } else {
            persist(items.filter((i) => i !== item));
        }
    }, [user, items]);

    const isInWishlist = useCallback((item) => items.some(
        (i) => i.itemType === item.itemType && (
            (item.productId && (i.productId?._id === item.productId || i.productId === item.productId)) ||
            (item.customizationId && (i.customizationId?._id === item.customizationId || i.customizationId === item.customizationId))
        ),
    ), [items]);

    return (
        <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
