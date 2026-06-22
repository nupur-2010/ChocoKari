// @ts-nocheck
import { useEffect, useRef, useState } from "react";

const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google);
            return;
        }
        const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existing) {
            const checkLoaded = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(checkLoaded);
                    resolve(window.google);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkLoaded);
                if (window.google?.accounts?.id) resolve(window.google);
                else reject(new Error("Google script load timeout"));
            }, 15000);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(script);
    });
};

export default function GoogleSignInButton({ onCredential, text = "Sign in using Google", disabled = false }) {
    const buttonRef = useRef(null);
    const [error, setError] = useState("");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const googleButtonText = text.toLowerCase().includes("sign up") || text.toLowerCase().includes("signup")
        ? "signup_with"
        : text.toLowerCase().includes("continue")
            ? "continue_with"
            : "signin_with";

    useEffect(() => {
        if (!clientId || clientId === "PLACEHOLDER_REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID") {
            setError("Google sign-in is not configured");
            return;
        }

        let cancelled = false;

        loadGoogleScript()
            .then(() => {
                if (cancelled || !buttonRef.current) return;
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });
                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: googleButtonText,
                    shape: "pill",
                    width: 320,
                    logo_alignment: "left",
                });
            })
            .catch((err) => {
                console.error("Google Sign-In error:", err);
                if (!cancelled) setError("Google sign-in failed to load");
            });

        return () => {
            cancelled = true;
        };
    }, [clientId, googleButtonText]);

    if (error) {
        return (
            <div className="w-full text-center">
                <p className="text-xs text-chocolate/50">{error}</p>
            </div>
        );
    }

    return (
        <div
            ref={buttonRef}
            className={`flex justify-center w-full min-h-[40px] ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        />
    );
}
