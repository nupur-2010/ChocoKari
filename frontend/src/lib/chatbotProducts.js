// @ts-nocheck
import { api } from "./api";

const CACHE_TTL = 5 * 60 * 1000;
let cache = { data: null, fetchedAt: 0, inFlight: null };

export const fetchChatbotProducts = async () => {
    const now = Date.now();
    if (cache.data && now - cache.fetchedAt < CACHE_TTL) return cache.data;
    if (cache.inFlight) return cache.inFlight;
    cache.inFlight = api
        .get("/product")
        .then((r) => {
            const products = r?.data?.data?.products || [];
            cache = { data: products, fetchedAt: Date.now(), inFlight: null };
            return products;
        })
        .catch((e) => {
            cache.inFlight = null;
            return cache.data || [];
        });
    return cache.inFlight;
};

export const getProductsByIntensity = (products, intensity) => {
    if (!products || !products.length) return [];
    return products.filter((p) =>
        p.attributes?.intensity?.some((i) => i.toLowerCase() === intensity.toLowerCase()),
    );
};

export const getProductsByCollection = (products, collection) => {
    if (!products || !products.length) return [];
    return products.filter(
        (p) => p.collection && p.collection.toLowerCase() === collection.toLowerCase(),
    );
};

export const getBestsellers = (products) => {
    if (!products || !products.length) return [];
    return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
};
