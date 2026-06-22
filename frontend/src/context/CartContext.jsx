// @ts-nocheck
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};

const LOCAL_CART_KEY = "chocokari_local_cart";

const readLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || []; }
    catch { return []; }
};
const writeLocal = (c) => localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(c));

const sortAnswers = (answers = []) =>
    [...answers]
        .map((a) => `${a.question}::${a.answer}`)
        .sort()
        .join("|");

const fingerprint = (item) => {
    if (item.itemType === "product") {
        const productId = item.productId?._id
            ? item.productId._id.toString()
            : item.productId?.toString();
        return `p|${productId}|${sortAnswers(item.customQuestionAnswer)}|${item.giftPackaging ? 1 : 0}|${item.message || ""}`;
    }
    const c = item.customizationId;
    const snap = item.customSnapshot;
    const box = c?.box || snap?.box;
    const size = c?.size || snap?.size;
    const intensity = c?.preferredIntensity || snap?.preferredIntensity;
    const stickers = c?.stickers || snap?.stickers;
    const gift = (c?.giftPackaging ?? snap?.giftPackaging) ? 1 : 0;
    const message = c?.message ?? snap?.message ?? "";
    const arrangement = ((c?.arrangement || snap?.arrangement) || []).map((a) => a.flavour).join(",");
    if (!box && !size) return `c|empty`;
    return `c|${box}|${size}|${intensity}|${stickers}|${gift}|${message}|${arrangement}`;
};

const fingerprintForNew = (item) => {
    if (item.itemType === "product") {
        return `p|${item.productId}|${sortAnswers(item.customQuestionAnswer)}|${item.giftPackaging ? 1 : 0}|${item.message || ""}`;
    }
    const c = item.customizationId;
    const snap = item.customSnapshot;
    if (snap) {
        const arrangement = (snap.arrangement || []).map((a) => a.flavour).join(",");
        return `c|${snap.box}|${snap.size}|${snap.preferredIntensity}|${snap.stickers}|${snap.giftPackaging ? 1 : 0}|${snap.message || ""}|${arrangement}`;
    }
    return `c|${c}|nosnap`;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState(readLocal);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const sync = async () => {
            if (user) {
                setLoading(true);
                try {
                    const res = await api.get("/cart");
                    setItems(res?.data?.data?.cart || []);
                } catch (e) {
                    setItems([]);
                } finally {
                    setLoading(false);
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
            const res = await api.post("/cart", { ...item, quantity: item.quantity || 1 });
            setItems(res?.data?.data?.cart || []);
        } else {
            const newFp = fingerprintForNew(item);
            const existing = items.find((i) => fingerprint(i) === newFp);
            let next;
            if (existing) {
                next = items.map((i) => i === existing
                    ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
                    : i);
            } else {
                next = [...items, { ...item, quantity: item.quantity || 1 }];
            }
            persist(next);
        }
    }, [user, items]);

    const updateItem = useCallback(async (item, quantity) => {
        if (user) {
            const payload = {
                itemType: item.itemType,
                productId: item.productId?._id || item.productId,
                customizationId: item.customizationId?._id || item.customizationId,
                quantity,
            };
            const res = await api.put("/cart", payload);
            setItems(res?.data?.data?.cart || []);
        } else {
            let next;
            if (quantity <= 0) {
                next = items.filter((i) => i !== item);
            } else {
                next = items.map((i) => i === item ? { ...i, quantity } : i);
            }
            persist(next);
        }
    }, [user, items]);

    const removeItem = useCallback(async (item) => {
        if (user) {
            const c = item.customizationId;
            const data = {
                itemType: item.itemType,
                productId: item.productId?._id || item.productId,
                customizationId: c?._id || c,
            };
            if (item.itemType === "product") {
                data.customQuestionAnswer = item.customQuestionAnswer || [];
                data.giftPackaging = !!item.giftPackaging;
                data.message = item.giftPackaging ? (item.message || "") : null;
            } else {
                if (c) {
                    data.customQuestionAnswer = [];
                    data.giftPackaging = !!c.giftPackaging;
                    data.message = c.giftPackaging ? (c.message || "") : null;
                } else if (item.customSnapshot) {
                    data.customQuestionAnswer = [];
                    data.giftPackaging = !!item.customSnapshot.giftPackaging;
                    data.message = item.customSnapshot.giftPackaging ? (item.customSnapshot.message || "") : null;
                }
            }
            const res = await api.delete("/cart", { data });
            setItems(res?.data?.data?.cart || []);
        } else {
            persist(items.filter((i) => i !== item));
        }
    }, [user, items]);

    const clear = useCallback(async () => {
        if (user) {
            try { await api.post("/cart/clear"); } catch (e) {}
        }
        persist([]);
    }, [user]);

    const count = items.reduce((s, i) => s + (i.quantity || 1), 0);

    return (
        <CartContext.Provider value={{ items, loading, count, addItem, updateItem, removeItem, clear }}>
            {children}
        </CartContext.Provider>
    );
};
